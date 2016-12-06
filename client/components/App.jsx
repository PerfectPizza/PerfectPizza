window.marker = {}

class App extends React.Component {
  constructor(){
    super()
    this.state = {
      events: window.events,
      users: window.users,
      map: null
    }
  }

  render(){
    return (
      <div>
      <NavBar key={'navbar'}/>
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
              <EventList key="Events" users={this.state.users} events={this.state.events} />
            </ReactBootstrap.Col>
          </ReactBootstrap.Row>
        </ReactBootstrap.Grid>
      </div>
    )
  }

}

function NavBar () {
  return (
    <div>
      <ReactBootstrap.Nav bsStyle="pills" justified>
        <ReactBootstrap.NavItem eventKey={1}>NavItem 1 content</ReactBootstrap.NavItem>
        <ReactBootstrap.NavItem eventKey={2}>NavItem 2 content</ReactBootstrap.NavItem>
        <ReactBootstrap.NavItem eventKey={3}>NavItem 3 content</ReactBootstrap.NavItem>
      </ReactBootstrap.Nav>
    </div>
  )
}

class Map extends React.Component {
  constructor (props) {
    super()
    this.state = {
    }
  }

  componentDidMount () {

      var myLatlng = new google.maps.LatLng(30.256729, -97.739650);
      // var myDiv = ReactDOM.findDOMNode(this);
      var mapOptions = {
            zoom: 14,
            center: myLatlng
        }
        window.map = new google.maps.Map(document.getElementById('map'), mapOptions)
        map = window.map

// ---------------------- BEGIN AUTOCOMPLETE SEARCHBAR TEST ------------------------------------------


 // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      
// ---------------------- END SEARCHBAR AUTOCOMPLETE TEST --------------------------------------

}

  render() {
    return (
      <div>
        <input id="pac-input" class="controls" type="text" placeholder="Search Box" />
        <div style={{width: "66vw", height: "80vh"}} id="map"></div>
      </div>
    )
  }
}


function EventList (props) {

    return (
      <div className="eventlist">
        {
          props.events.map(function(event){
            return (
              <Event users={props.users} event={event} />
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
      creator: props.event.creator,
      id: props.event.id,
      description: props.event.description,
      startTime: props.event.startTime,
      endTime: props.event.endTime,
      latitude: props.event.lat,
      longitude: props.event.long,
      users: props.users,
      marker: null
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

    this.setState({marker: marker})

    $('div #' + this.state.id).on('click', function() {
        console.log("THIS IS CLICKED", this)
          console.log("Marker? ", marker)
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
        window.location.href = window.location.href.split('#')[0] + '#' + this.id;
        //reset activeEvent class assignments
        $('.event').removeClass('activeEvent');
        //change background color of selected event
        $('#' + this.id).addClass('activeEvent');
      })



    }

    return (
      <div className="event" id={this.state.id}>
        <p className="eventText">Host: {this.state.users[this.state.creator].name}</p>
        <p className="eventText">Start Time: {this.state.startTime}  End Time: {this.state.endTime}</p>
        <p className="eventText">Description: {this.state.description}</p>
      </div>
    )
  }
}


ReactDOM.render(<App key="MainApp"/>, document.getElementById('app'))
