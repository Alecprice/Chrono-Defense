import React from 'react';

export class OptionalFeatureBoundary extends React.Component {
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(error,info){
    console.error(`Chrono optional feature failed: ${this.props.name??'unknown'}`,error,info);
  }
  render(){return this.state.failed?null:this.props.children;}
}
