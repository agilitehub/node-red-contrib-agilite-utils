module.exports = function (RED) {
  function Various (config) {
    RED.nodes.createNode(this, config)
    const node = this
    this.field = config.field || 'payload'
    this.fieldType = config.fieldType || 'msg'

    this.on('input', (msg) => {
      const TypeDetect = require('agilite-utils/type-detect')
      const EnumsTypeDetect = require('agilite-utils/enums-type-detect')
      const Utils = require('agilite-utils')
      const MD5 = require('md5')
      const ObjectID = require('bson-objectid')
      const Mustache = require('mustache')
      const Crypto = require('crypto')
      const Entities = require('entities')
      const UUID = require('agilite-utils/uuid')

      let typeResult = ''
      let errMsg = null
      let value = null
      let value2 = null
      let value3 = null
      let data = null

      try {
        // Validate
        switch (config.actionType) {
          case '2': // Generate MD5 Hash
            if (!msg.payload || (TypeDetect(msg.payload) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid string to hash'
            }

            break
          case '4': // Create HMAC Object
            value = Mustache.render(config.algorithm, msg)
            value2 = Mustache.render(config.key, msg)
            value3 = Mustache.render(config.digest, msg)

            if (!value || (TypeDetect(value) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid Algorithm in order to create a HMAC Object'
            } else if (!value2 || (TypeDetect(value2) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid Key in order to create a HMAC Object'
            } else if (!value3 || (TypeDetect(value3) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid Digest in order to create a HMAC Object'
            } else if (!msg.payload || (TypeDetect(msg.payload) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid string payload in order to create a HMAC Object'
            }

            break
          case '5': // Generate Nonce
            value = Mustache.render(config.byteSize, msg)
            value2 = Mustache.render(config.outputType, msg)

            if (!value || !Utils.isNumber(value)) {
              errMsg = 'Please provide a valid Size in order to generate a Nonce'
            } else if (!value2 || (TypeDetect(value2) !== EnumsTypeDetect.STRING)) {
              errMsg = 'Please provide a valid Output Type in order to generate a Nonce'
            }

            break
          case '7': // Encode XML
          case '8': // Decode XML
            // Make sure data is a string
            if (TypeDetect(msg.payload) !== EnumsTypeDetect.STRING) {
              msg.payload = ''
            }

            data = msg.payload
            break
        }

        if (errMsg) {
          return node.error(errMsg, msg)
        }

        // Process logic based on actionType
        switch (config.actionType) {
          case '1': // Detect Payload Type
            typeResult = TypeDetect(msg.payload)
            break
          case '2': // Generate MD5 Hash
            typeResult = MD5(msg.payload)
            break
          case '3': // Generate MongoDB Object Id
            typeResult = ObjectID()
            break
          case '4': // Create HMAC Object
            typeResult = Crypto.createHmac(value, value2).update(msg.payload).digest(value3)
            break
          case '5': // Generate Nonce
            value = parseInt(value)
            typeResult = Crypto.randomBytes(value).toString(value2)
            break
          case '6': // Is Number
            typeResult = Utils.isNumber(msg.payload)
            break
          case '7': // Encode XML
            typeResult = Entities.encodeXML(data)
            break
          case '8': // Decode XML
            typeResult = Entities.decodeXML(data)
            break
          case '9': // Generate UUID
            typeResult = UUID.v1()
            break
        }

        switch (node.fieldType) {
          case 'msg':
            RED.util.setMessageProperty(msg, node.field, typeResult)
            break
          case 'flow':
            node.context().flow.set(node.field, typeResult)
            break
          case 'global':
            node.context().global.set(node.field, typeResult)
            break
        }

        node.send(msg)
      } catch (e) {
        console.log(e.stack || e.message || e)
        node.error(e.message || e.stack || e, msg)
      }
    })
  }

  RED.nodes.registerType('various', Various)
}
