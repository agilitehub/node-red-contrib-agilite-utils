module.exports = function (RED) {
  function TypeDetect (config) {
    RED.nodes.createNode(this, config)
    this.field = config.field || 'payload'
    this.fieldType = config.fieldType || 'msg'
    var node = this

    const typeDetect = require('type-detect')

    this.on('input', function (msg) {
      // Declcare variables for each of the input fields
      let typeResult = ''

      try {
        typeResult = typeDetect(msg.payload)

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
      } catch (err) {
        node.error(err, msg)
      }
    })
  }

  RED.nodes.registerType('type-detect', TypeDetect)
}
