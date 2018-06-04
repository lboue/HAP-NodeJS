var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var timeoutObj = "";

// here's a fake hardware device that we'll expose to HomeKit
var FAUCET = {
  active: false,
  name: "Fake faucet",
  typeName: "faucet",
  timerEnd: 0,
  defaultDuration: 3600,

  getStatus: function() {
    //set the boolean here, this will be returned to the device
    FAUCET.motionDetected = false;
  },
  identify: function() {
    console.log("Identify the faucet!");
  }
}


// Generate a consistent UUID for our Motion Sensor Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "motionsensor".
var faucetUUID = uuid.generate('hap-nodejs:accessories:faucet');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake motionSensor.
var sprinkler = exports.accessory = new Accessory('?? Faucet', faucetUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sprinkler.username = "A3:AB:3D:4D:2E:A4";
sprinkler.pincode = "123-44-567";

// Add the actual Valve Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
var sprinklerService = sprinkler.addService(Service.Valve, "?? Faucet")


// set some basic properties (these values are arbitrary and setting them is optional)
sprinkler
  .getService(Service.Valve)
  .setCharacteristic(Characteristic.ValveType, "3") // IRRIGATION/SPRINKLER = 1; SHOWER_HEAD = 2; WATER_FAUCET = 3;
  .setCharacteristic(Characteristic.Name, FAUCET.name)
  ;

sprinkler
  .getService(Service.Valve)
  .getCharacteristic(Characteristic.Active)
  .on('get', function(callback) {

    console.log("get Active");
    var err = null; // in case there were any problems

    if (FAUCET.active) {
      callback(err, true);
    }
    else {
      callback(err, false);
    }
  })
  .on('set', function(newValue, callback) {

    console.log("set Active => setNewValue: " + newValue);
    
    if (FAUCET.active) {
      FAUCET.active = false;
      closeVentile();
      clearTimeout(timeoutObj);

      setTimeout(function() {
        console.log("Switched off");        
        FAUCET.timerEnd = FAUCET.defaultDuration + Math.floor(new Date() / 1000);
        callback(null);

        sprinkler
        .getService(Service.Valve)
        .setCharacteristic(Characteristic.SetDuration, 0);        

        sprinkler
        .getService(Service.Valve)
        .setCharacteristic(Characteristic.InUse, Characteristic.InUse.NOT_IN_USE);
        
         sprinkler
        .getService(Service.Valve)
        .updateCharacteristic(Characteristic.InUse, Characteristic.InUse.NOT_IN_USE);          

      }, 1000);
    }
    else {
      FAUCET.active = true;
      openVentile();
      setTimeout(function() {
        console.log(FAUCET.typeName + " Turn On");
        FAUCET.timerEnd = FAUCET.defaultDuration + Math.floor(new Date() / 1000);

        clearTimeout(timeoutObj);
        timeoutObj = setTimeout(() => {
          
          closeVentile();
          
          sprinkler
          .getService(Service.Valve)
          .setCharacteristic(Characteristic.InUse, Characteristic.InUse.NOT_IN_USE);
          
          sprinkler
          .getService(Service.Valve)
          .updateCharacteristic(Characteristic.InUse, Characteristic.InUse.NOT_IN_USE);
          
          sprinkler
          .getService(Service.Valve)
          .setCharacteristic(Characteristic.Active, Characteristic.Active.INACTIVE);
        
          console.log(FAUCET.typeName + "Turn Off");                  

        }, FAUCET.defaultDuration * 1000);
        
        callback(null, FAUCET.defaultDuration);
        
        sprinkler
        .getService(Service.Valve)
        .setCharacteristic(Characteristic.ProgramMode, Characteristic.ProgramMode.PROGRAM_SCHEDULED);

        sprinkler
        .getService(Service.Valve)
        .setCharacteristic(Characteristic.InUse, Characteristic.InUse.IN_USE);

        sprinkler
        .getService(Service.Valve)
        .setCharacteristic(Characteristic.SetDuration, FAUCET.defaultDuration);

        sprinkler
        .getService(Service.Valve)
        .updateCharacteristic(Characteristic.InUse, Characteristic.InUse.IN_USE);
        
      }, 1000);
    }
  });


sprinkler
  .getService(Service.Valve)
  .getCharacteristic(Characteristic.InUse)
  .on('get', function(callback) {
    console.log(FAUCET.typeName + " get In_Use");
    var err = null; // in case there were any problems

    if (FAUCET.active) {
      callback(err, true);
    }
    else {
      callback(err, false);
    }
  })
  .on('set', function(newValue, callback) {
    console.log(FAUCET.typeName + " set In_Use => NewValue: " + newValue);    
  });


  sprinkler
  .getService(Service.Valve)
  .getCharacteristic(Characteristic.RemainingDuration)
  .on('get', function(callback) {

    var err = null; // in case there were any problems

    if (FAUCET.active) {
      
      var duration = FAUCET.timerEnd - Math.floor(new Date() / 1000);
      console.log(FAUCET.typeName + " RemainingDuration: " + duration + "s")
      callback(err, duration);
    }
    else {
      callback(err, 0);
    }
  });


  sprinkler
  .getService(Service.Valve)
  .getCharacteristic(Characteristic.SetDuration)
  .on('set', function(newValue, callback) {
    console.log(FAUCET.typeName + " SetDuration => NewValue: " + newValue + "s")
    
    var err = null; // in case there were any problems
    FAUCET.defaultDuration = newValue;
    callback();  
  });


  // Sprinkler Controll
  function openVentile() {
    // Add your code here
  }

  function closeVentile() {
    // Add your code here
  }
 
