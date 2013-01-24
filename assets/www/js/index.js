var app = {
    
    // Application Constructor
    initialize: function() {
        this.domStatus = document.getElementById('statuses');
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('load', this.onLoad, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('online', this.onOnline, false);
    },
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Device is Ready');
        
        // nfc event listener
		nfc.addNdefListener(
			app.onNfc,
		    function() {
		        console.log("Listening for NDEF tags.");
		    },
		    app.fail
		);
		
		// android launches the app when tags with text/pg are scanned
        // phonegap-nfc fires an ndef-mime event
        // reusing the same onNfc handler
        nfc.addMimeTypeListener(
            'text/pg',
            app.onNfc,
            function() {
                console.log("Listening for NDEF mime tags with type text/pg.");
            },
            app.fail
        );

        // read unformatted ndef tags using the same listener
        nfc.addNdefFormatableListener(
            app.onNfc,
            function() {
                console.log("Listening for unformatted tags.");
            },
            app.fail
        );
    },
    onLoad: function() {
        app.receivedEvent('deviceready');
    },
    onOffline: function() {
        app.receivedEvent('offline');
    },
    onOnline: function() {
        app.receivedEvent('online');
    },
    receivedEvent: function(id) {
        // Update DOM on a Received Event   
        this.domStatus.innerHTML = id;
    },
    onNfc: function(nfcEvent) {
	    console.log(JSON.stringify(nfcEvent.tag));
	    app.clearScreen();
	
	    var tag = nfcEvent.tag;    
	    var records = tag.ndefMessage || [],
	    
	    display = document.getElementById("console");
	    display.appendChild(
	        document.createTextNode(
	            "Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "": "s")
	        )
	    );
	    
	    // Display Tag Info
	    var meta = document.createElement('dl');
	    display.appendChild(meta);
	        
        if (tag.id) {
            showProperty(meta, "Id", nfc.bytesToHexString(tag.id));        
        }
        
        app.showProperty(meta, "Tag Type", tag.type);        
        app.showProperty(meta, "Max Size", tag.maxSize + " bytes");
        app.showProperty(meta, "Is Writable", tag.isWritable);
        app.showProperty(meta, "Can Make Read Only", tag.canMakeReadOnly);   
        app.showProperty(meta, "Raw", JSON.stringify(tag));
	
	    // Display Record Info
	    for (var i = 0; i < records.length; i++) {
	        var record = records[i],
	        p = document.createElement('p');
	        p.innerHTML = template(record);
	        display.appendChild(p);
	    }
	    
	    navigator.notification.vibrate(100);
	},
	showProperty: function(parent, name, value) {
	    var dt, dd;
	    dt = document.createElement("dt");
	    dt.innerHTML = name;
	    dd = document.createElement("dd");
	    dd.innerHTML = value;
	    parent.appendChild(dt);
	    parent.appendChild(dd);
	},
	clearScreen: function() {
	    document.getElementById("console").innerHTML = "";
	},
	fail: function(reason) {
        navigator.notification.alert(reason, function() {}, "There was a problem");
    }
};
