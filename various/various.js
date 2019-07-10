module.exports = function(RED){
    function Various(config){
        RED.nodes.createNode(this, config);
        this.field = config.field || "payload";
        this.fieldType = config.fieldType || "msg";
        var node = this;

        const typeDetect = require('type-detect'); //TODO: Require typeof module from npm here
        const md5 = require('md5');

        this.on("input", function(msg){
            //Declcare variables for each of the input fields
            let actionType = config.actionType;
            let typeResult = "";
            let success = true;
            let errorMessage = "";

            //Process logic based on actionType
            switch (actionType){
                case "1":
                    typeResult = typeDetect(msg.payload);
                    break;
                case "2":
                    typeResult = md5(msg.payload);
                    break;
            }

            switch (node.fieldType) {
                case "msg":
                    RED.util.setMessageProperty(msg, node.field, typeResult);
                    break;
                case "flow":
                    node.context().flow.set(node.field, typeResult);
                    break;
                case "global":
                    node.context().global.set(node.field, typeResult);
                    break;
            }
            
            
            node.send(msg);
        });
    }

    RED.nodes.registerType("various", Various);

}