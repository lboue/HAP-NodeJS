var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;


var FAKE_GARAGE = {
  opened: false,
  open: function() {
    console.log("[GDC] Opening the Garage!");
    //add your code here which allows the garage to open
    FAKE_GARAGE.opened = true;
  },
  close: function() {
    console.log("[GDC] Closing the Garage!");
    //add your code here which allows the garage to close
    FAKE_GARAGE.opened = false;
  },
  identify: function() {
    //add your code here which allows the garage to be identified
    console.log("[GDC] Identify the Garage");
  },
  status: function(){
    //use this section to get sensor values. set the boolean FAKE_GARAGE.opened with a sensor value.
    console.log("[GDC] Sensor queried!");
    //FAKE_GARAGE.opened = true/false;
  }
};

var garageUUID = uuid.generate('hap-nodejs:accessories:'+'GarageDoor');
var garage = exports.accessory = new Accessory('Garage Door', garageUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
garage.username = "C1:5D:3F:EE:5E:FA"; //edit this if you use Core.js
garage.pincode = "031-45-154";

garage
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Liftmaster")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  //.setCharacteristic(Characteristic.SerialNumber, "TW000165");
  .setCharacteristic(Characteristic.SerialNumber, "TW000165")
  .setCharacteristic(Characteristic.ObstructionDetected, true);

garage.on('identify', function(paired, callback) {
  FAKE_GARAGE.identify();
  callback();
});

//  set TargetDoorState
/*
 * The value property of CurrentDoorState must be one of the following:
Characteristic.CurrentDoorState.OPEN = 0;
Characteristic.CurrentDoorState.CLOSED = 1;
Characteristic.CurrentDoorState.OPENING = 2;
Characteristic.CurrentDoorState.CLOSING = 3;
Characteristic.CurrentDoorState.STOPPED = 4;
 */
garage
  .addService(Service.GarageDoorOpener, "Garage Door")
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      FAKE_GARAGE.close();
      callback();
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {
      FAKE_GARAGE.open();
      callback();
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
      
      // Fake Obstruction
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.ObstructionDetected, true);
    }
  });

//  get CurrentDoorState
garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    var err = null;
    FAKE_GARAGE.status();

    if (FAKE_GARAGE.opened) {
      console.log("[GDC] Query: Is Garage Open? Yes.");
      callback(err, Characteristic.CurrentDoorState.OPEN);
    }
    else {
      console.log("[GDC] Query: Is Garage Open? No.");
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });

//  get ObstructionDetected
garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.ObstructionDetected)
  .on('get', function(callback) {

    var err = null;
    FAKE_GARAGE.status();

    
        if (FAKE_GARAGE.opened) {
      console.log("[GDC] Query: Is Garage obstructed? Yes.");
      callback(err, Characteristic.ObstructionDetected.OPEN);
    }
    else {
      console.log("[GDC] Query: Is Garage obsctructed? No.");
      callback(err, Characteristic.ObstructionDetected.CLOSED);
    }

  });
