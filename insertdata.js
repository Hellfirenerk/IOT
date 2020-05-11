var mqtt = require('mqtt'); //https://www.npmjs.com/package/mqtt
var Topic = '#'; //subscribe to all topics
var Broker_URL = ('mqtt://172.18.0.4')//MQTT_BROKER_URL';
var Database_URL = '172.18.0.3';



var options = {
        clientId: 'MyMQTT',
        port: 1883,
        //username: 'mqtt_user',
        //password: 'mqtt_password',    
        keepalive : 60
};

var client  = mqtt.connect(Broker_URL, options);
client.on('connect', mqtt_connect);
client.on('reconnect', mqtt_reconnect);
client.on('message', mqtt_messsageReceived);
client.on('close', mqtt_close);

function mqtt_connect() {
    console.log("Connecting MQTT");
    client.subscribe(Topic, mqtt_subscribe);
};

function mqtt_subscribe(err, granted) {
    console.log("Subscribed to " + Topic);
    if (err) {console.log(err);}
};

function mqtt_reconnect(err) {
    console.log("Reconnect MQTT");
    if (err) {console.log(err);}
        client  = mqtt.connect('172.18.0.4', options);
};



function after_publish() {
        //do nothing
};

//receive a message from MQTT broker
function mqtt_messsageReceived(topic, message, packet) {
        var message_str = message.toString(); //convert byte array to string
        message_str = message_str.replace(/\n$/, ''); //remove new line
        //message_str = message_str.toString().split("|");
        //payload syntax: clientID,topic,message
        if (message_str.length == 0) {
                console.log("Invalid payload");
                } else {        
                insert_message(topic, message_str, packet);
                //console.log(message_arr);
        }
};

function mqtt_close() {
        //console.log("Close MQTT");
};

////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////
var mysql = require('mysql'); //https://www.npmjs.com/package/mysql
//Create Connection
var connection = mysql.createConnection({
        host: Database_URL,
        user: "vulnUser",
        password: "vulnPassword",
        database: "heater"
});

connection.connect(function(err) {
        if (err) throw err;
        //console.log("Database Connected!");
});

//insert a row into the tbl_messages table
function insert_message(topic, message_str, packet) {
        var message_arr = extract_string(message_str); //split a string into an array
        var data1= message_arr[0];
        var data2= message_arr[1];
        var data3= message_arr[2];
        var sql = "INSERT INTO heaters (name,temperature,status) VALUES (?,?,?)";
        var params = [data1, data2, data3];
        sql = mysql.format(sql, params);        

        connection.query(sql, function (error, results) {
                if (error) throw error;
                console.log("Data added: " + message_str);
        }); 
};      

//split a string into an array of substrings
function extract_string(message_str) {
        var message_str = message_str.replace(/[\[\]']/g,'' );
        var message_str = message_str.replace(/"/g,"");
        var message_arr = message_str.split(","); //convert to array    
        return message_arr;
};      

//count number of delimiters in a string
var delimiter = ",";
function countInstances(message_str) {
        var substrings = message_str.split(delimiter);
        return substrings.length - 1;
};







