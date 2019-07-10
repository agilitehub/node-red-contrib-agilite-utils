module.exports = function(RED){
    function Lodash(config){
        RED.nodes.createNode(this, config);
        this.field = config.field || "payload";
        this.fieldType = config.fieldType || "msg";
        var node = this;

        const _ = require('lodash');
        const Mustache = require("mustache");

        this.on("input", function(msg){
            //Declcare variables for each of the input fields
            let actionType = config.actionType;
            let inputValue = config.inputValue;
            let success = true;
            let result = "";

            //Validate Fields
            if (config.actionType === ""){
                success = false;
                errorMessage = "Please select an Action Type";
            }else if(config.inputValue === ""){
                success = false;
                errorMessage = "Please provide a Input Value";
            }

            if(!success){
                node.error(errorMessage, msg);
                return false;
            }

            inputValue = Mustache.render(inputValue, msg);

            try{
                switch (actionType) {
                    case "escape":
                        result = _.escape(inputValue);
                        break;
                    case "unescape":
                        result = _.unescape(inputValue);
                        break;
                    case "uniqueid":
                        result = _.uniqueId(inputValue);   
                        break;
                    case "pad":
                        result = _.pad(inputValue, config.param, config.param2);
                        break;
                } 

                switch (node.fieldType) {
                    case "msg":
                        RED.util.setMessageProperty(msg, node.field, result);
                        break;
                    case "flow":
                        node.context().flow.set(node.field, result);
                        break;
                    case "global":
                        node.context().global.set(node.field, result);
                        break;
                }
                
                node.send(msg);
            }catch(err){
                node.error(err, msg);
            }
        });
    }

    RED.nodes.registerType("lodash", Lodash);

}