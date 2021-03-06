window.markers = []

class App extends React.Component {
  constructor(){
    super()
    window.that = this;
    this.state = {
      events: window.userEvents,
      users: window.users,
    }
  }

  updateApp() {
    this.setState({events:window.userEvents});
  }

  render(){
    return (
      <div>
      {/* this a boostrap layout for the page */}
        <ReactBootstrap.Grid fluid>
          {/* A row for the map and events*/}
          <ReactBootstrap.Row className="show-grid">
            {/* The column where the google map is located*/}
            <ReactBootstrap.Col md={8}>
              <Map key="MAP" />
            </ReactBootstrap.Col>
            {/* The column where the events are located*/}
            <ReactBootstrap.Col md={4}>
              <CreateEventForm updateApp={this.updateApp.bind(this)}/>
              <EventList key="Events" updateApp={this.updateApp.bind(this)} users={this.state.users} events={this.state.events} />
            </ReactBootstrap.Col>
          </ReactBootstrap.Row>
        </ReactBootstrap.Grid>
      </div>
    )
  }

}

class Map extends React.Component {
  constructor (props) {
    super()
    this.state = {
    }
  }

  componentDidMount () {

      var myLatlng = new google.maps.LatLng(30.256729, -97.739650);
      var mapOptions = {
            zoom: 14,
            center: myLatlng
        }
        window.map = new google.maps.Map(document.getElementById('map'), mapOptions)
}

  render() {
    return (
      <div>
        <div style={{width: "100vw", height: "100vh"}} id="map"></div>
      </div>
    )
  }
}


function EventList (props) {
var attendance;
    return (
      <div className="eventlist">


        {
          props.events.allevents.map(function(event){
            //Order matters here so that only one of the three attendance states is reached:
            //1) check if the current user is the creator of the event.
            //2) check if the current user is a friend of the creator of the event.
            //3) Finally, check if the current user is attending the event, which is only
            //possible if the user is a friend of the event creator
            if(event.creator_id === window.user.id){
              attendance = "creator";
            }
            else {
              window.user.friends.data.forEach(function(friend){
                if(event.creator_id === friend.id){
                  attendance = "friend"
                }
              })
              window.userEvents.allevents.forEach(function(eventID){
                if(eventID === event.id){
                  attendance = "attendee"
                }
              })
            }

            return (
              <Event updateApp={props.updateApp} users={props.users} event={event} attendance={attendance} />
            )

            })
        }
      </div>
    )
}

class Event extends React.Component {
  constructor(props){

    super(props)
    this.state = {
      creator: window.friends[props.event.creator_id] || window.user.name,
      id: props.event.id,
      description: props.event.description,
      date: props.event.start_time.split('T')[0].replace(/-/g, ' '),
      startTime: `${(new Date(props.event.start_time).getHours() + "0").slice(0,2)}:${(new Date(props.event.start_time).getMinutes() + "0").slice(0,2)}`,
      endTime: `${(new Date(props.event.end_time).getHours() + "0").slice(0,2)}:${(new Date(props.event.end_time).getMinutes() + "0").slice(0,2)}`,
      latitude: Number(props.event.latitude),
      longitude: Number(props.event.longitude),
      users: window.users,
      marker: null,
      attendance: props.attendance,
      address: props.event.address
    }
  }

componentDidMount () {
  //set current event's gps coordinates
  var gpsCoords = new google.maps.LatLng(this.state.latitude, this.state.longitude);

    //set marker state to a new Google Maps Marker (pin)
    var marker = new google.maps.Marker({
        id: this.state.id,
        position: gpsCoords,
        title: this.state.description,
        map: window.map
    })


    window.markers.push(marker)
    this.setState({marker: marker})

    $('div #' + this.state.id).on('click', function() {
          for(let marker of window.markers){marker.setAnimation(null)}

          marker.setAnimation(google.maps.Animation.BOUNCE)

          map.setCenter(marker.getPosition())

          $('.event').removeClass('activeEvent');
          $('#' + this.id).addClass('activeEvent');

      })

}

  render() {

    //if marker is already set to the state, then add click listener
    if(this.state.marker) {
      this.state.marker.addListener('click', function() {
        //link each pin to its corresponding Event in the EventList
        for(let marker of window.markers){marker.setAnimation(null)}
          this.setAnimation(google.maps.Animation.BOUNCE)
        window.location.href = window.location.href.split('#')[0] + '#' + this.id;
        //reset activeEvent class assignments
        $('.event').removeClass('activeEvent');
        //change background color of selected event
        $('#' + this.id).addClass('activeEvent');
      })
    }

    return (

       <div className="event" id={this.state.id}>
        <p className="eventText">Host: {this.state.creator}</p>
        <p className="eventText">Date: {this.state.date}</p>
        <p className="eventText">Start Time: {this.state.startTime}</p>
        <p className="eventText"> End Time: {this.state.endTime}</p>
        <p className="eventText"> Location: {this.state.address}</p>
        <p className="eventText">Description: {this.state.description}</p>
        </div>
        /*<EventAttendanceForm updateApp={this.props.updateApp} creator={this.state.creator} event={this.state.description} user={this.state.user} eventId={this.props.id} />*/
    )
  }
}

const CreateEventForm = React.createClass({
  getInitialState(props) {
    return { showModal: false,
      updateApp: this.props.updateApp
     };
  },

  componentDidUpdate () {
      // -------------------------   Create Event Map ------------------------------------
      var latLong = new google.maps.LatLng(30.256729, -97.739650);
      var mapOptions = {
            zoom: 10,
            center: latLong
        }

      var map = new google.maps.Map(document.getElementById('createEventMap'), mapOptions)

     // ------------------------------  Searchbar   --------------------------------------


      // Create the search box and link it to the UI element.
       var input = document.getElementById('pac-input2');

        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({
          map: map
        });

        autocomplete.addListener('place_changed', function() {
          $('.pac-container').show()
          infowindow.close();
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            return;
          }
          $('.pac-container').hide()
            map.setCenter(place.geometry.location);
            map.setZoom(13);

          // Set the position of the marker using the place ID and location.
          marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
          });
          marker.setVisible(true);

          //Access data on selected location and put in on the window
          window.place = {
            name: place.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address
          }
        });
},

  close() {
    this.setState({ showModal: false });
    $('.pac-container').hide()
  },

  open() {
    this.setState({ showModal: true });
    $('.pac-container').hide()
  },

  closeAndPost() {
    this.setState({ showModal: false});
    var $form = $('#createEventForm')
    var eventObj = {
      address: window.place.address,
      latitude: window.place.latitude.toString(),
      longitude: window.place.longitude.toString(),
      location_name: window.place.name,
      start_time: $form.find('input[name="start_time"]').val(),
      end_time: $form.find('input[name="end_time"]').val(),
      creator_id: window.user.id,
      description: $form.find('textarea[name="description"]').val(),
      title: $form.find('input[name="title"]').val(),
      cap: $form.find('input[name="cap"]').val(),
    };
    window.userEvents.allevents.unshift(eventObj);
    window.userEvents.events_created.unshift(eventObj);
    this.props.updateApp.call(window.that)
    $.ajax({
      type: "POST",
      url: 'events/new',
      data: JSON.stringify({user_id: window.user.id,event: eventObj}),
      contentType: 'application/json',
      success: (postResponse) => {
        // this.props.updateApp(window.userEvents).call(window.that);
      },
      error: (err) => console.error("ERROR", err),
    });
  },

  render() {
    return (
      <div>
        <ReactBootstrap.Button md={4}
          bsStyle="btn-circle"
          bsSize="large"
          onClick={this.open}
        >
        +
        </ReactBootstrap.Button>

        <ReactBootstrap.Modal
          show={this.state.showModal}
          onHide={this.close}
          aria-labelledby="ModalHeader"
        >
          <ReactBootstrap.Modal.Header closeButton>
            <ReactBootstrap.Modal.Title id='ModalHeader'>Send out an Open Invite</ReactBootstrap.Modal.Title>
          </ReactBootstrap.Modal.Header>
          <ReactBootstrap.Modal.Body>

            <div className="createEventFormDiv">

            <form class="form-horizontal" id="createEventForm" method="post" role="form"action="/events/new">

            <div class="form-group">
              <label for="name" class="cols-sm-2 control-label">Event Title</label>
              <div class="cols-sm-10">
                  <input type="text" class="form-control" name="title" id="eventTitle"  placeholder="what's it called"/>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="cols-sm-2 control-label">Event Description</label>
              <div class="cols-sm-10">
                  <textarea class="form-control" name="description" id="description"  placeholder="what's happening"/>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="cols-sm-2 control-label">Start Time</label>
              <div class="cols-sm-10">
                  <span class="input-group-addon"><i class="fa fa-user fa" aria-hidden="true"></i></span>
                  <input type="datetime-local" class="form-control" name="start_time" id="startTime"  placeholder="what's happening"/>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="cols-sm-2 control-label">End Time</label>
              <div class="cols-sm-10">
                  <span class="input-group-addon"><i class="fa fa-user fa" aria-hidden="true"></i></span>
                  <input type="datetime-local" class="form-control" name="end_time" id="endTime"  placeholder="what's happening" max={/*48 hours from now: */new Date(+new Date + 1.728e8).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0]}/>
                </div>
            </div>

            <div class="form-group">
              <label for="location" class="cols-sm-2 control-label">Event Size</label>
              <div class="cols-sm-1">
                  <input type="number" name="cap" id="cap"/>
                </div>
            </div>

            <div class="form-group">
              <label for="location" class="cols-sm-2 control-label">Location</label>
              <div class="cols-sm-10">
                  <input type="text" id="pac-input2" placeholder="Holiday Inn" autocomplete="on" style={{display: "block"}}/>
                  <div class="col-sm-10" style={{width: "100%", height: "40vh"}} id="createEventMap"></div>
                </div>
            </div>


           <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">
              <ReactBootstrap.Button md={4}
                  bsStyle="primary btn-block"
                  bsSize="large"
                  onClick={this.closeAndPost}
                >Publish</ReactBootstrap.Button>
              </div>
            </div>

          </form>
          </div>
          </ReactBootstrap.Modal.Body>
        </ReactBootstrap.Modal>
      </div>
    )
  }
})

class FacebookButton extends React.Component {
   constructor(props) {
      super(props);

      this.FB = props.fb;

      this.state = {
         message: ""
      };

   }

   componentDidMount() {
      this.FB.Event.subscribe('auth.logout',
         this.onLogout.bind(this));
      this.FB.Event.subscribe('auth.statusChange',
         this.onStatusChange.bind(this));
   }

   onStatusChange(response) {
      var self = this;

      if( response.status === "connected" ) {
         this.FB.api('/me', function(response) {
            var message = "Welcome " + response.name;
            self.setState({
               message: message
            });
         })
      }
   }

   onLogout(response) {
      this.setState({
         message: ""
      });
   }

  render() {
    return (
      <div>
        <div
          className="fb-login-button"
          data-max-rows="1"
          data-size="xlarge"
          data-auto-logout-link="true"
        >
        </div>
        <div>{this.state.message}</div>
      </div>
    );
  }
};

ReactDOM.render(<App key="MainApp"/>, document.getElementById('app'))
