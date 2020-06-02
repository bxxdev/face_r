import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';


// Initialize client API clarifai (face detection)

// const Clarifai = require('clarifai');

// const app = new Clarifai.App({
//  apiKey: '9d23ad81066f4912a4fea16d693de186'
// });


const particleOptions ={

                particles: {
                  number: {
                    value: 100,
                    density: {
                      enable: true,
                      value_area: 800
                    }
                  },

                  line_linked: {
                    shadow: {
                      enable: true,
                      color: "#3CA9D1",
                      blur: 5
                    }
                  }
                }
              }


const initialState ={
      input: '',
      imageUrl:'',
      box: {},
      route:'signin',
      isSignedIn: false,
      user:{
        id: '',
        name: '',
        email:'',
        entries: 0,
        joined: ''
      }
    }



class App extends Component {

  constructor (){
    super();
    this.state =initialState;
  }



loadUser=(data)=>{
  this.setState({user:{
        id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
  }})
}


// componentDidMount () {

//   fetch('http://localhost:3000').then(response=>response.json()).then(console.log);

// }




calculateFaceLocation =(data)=> {

   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image= document.getElementById('inputimage');
   const width = Number(image.width);
   const height = Number(image.height);
   // console.log("width: ", width, " height: ",height);
   return{

      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

   }
}



displayFaceBox =(box)=>{

  // console.log('displayFaceBox box', box);
  this.setState({box: box});

}


onInputChange =(event)=>{
    this.setState({input: event.target.value});
}


onButtonSubmit=()=>{
    
    this.setState({imageUrl:this.state.input});
    fetch('http://localhost:3000/imageurl',{
          method:'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          input: this.state.input
            })
        })
    .then(response=>response.json())

    // console.log ('click');
    

// app.models.initModel({id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40"})
//       .then(generalModel => {
//         return generalModel.predict("the-image-url");
//       })
//       .then(response => {
//         var concepts = response['outputs'][0]['data']['concepts']
//       })




// app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
  .then(response => {
    if (response){
        fetch('http://localhost:3000/image',{
          method:'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
            })
        })
        .then (response=>response.json())
        .then (count =>{
          this.setState(Object.assign(this.state.user, {entries:count}))
          })
        .catch(console.log)
       }
    this.displayFaceBox(this.calculateFaceLocation(response))

  })
      // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
   .catch(err=>console.log(err));       // there was an error
 
}


onRouteChange =(route)=>{
  if (route ==='signout'){
    // console.log('Sign out');
    return this.setState(initialState);
  }
  else if (route==='home'){
    this.setState({isSignedIn: true});
  }
  // console.log('Route outside of if: ', route);
  this.setState ({route: route});
  
}


  render () {

   const {isSignedIn, imageUrl, route, box} = this.state;

    return (

    <div className="App">

      <Particles className='particles'
          params={particleOptions}
        />

      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>

     {route === 'home'
      ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/> 
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>

      : (route === 'signin'
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        // ? <Signin onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

        ) 
    }
    </div>
  );
}
}

export default App;
