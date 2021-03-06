import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import RadarChart from './RadarChart.js'
import ConfusionDistribution from './ConfusionDistribution.js'
import ThresholdBar from './ThresholdBar.js'
import { Steps } from 'intro.js-react'
import 'intro.js/introjs.css'
import './styling/Visualizations.css';

export default class Visualizations extends Component {

	state = {
		metric: 'recall',
		metricValue: '',
		finalValues: '',
		stepsEnabled: false,
		initialStep: 0,
		steps: [
			{
				element: '#threshold',
				intro: "The model's current threshold for classifying edits as damaging or not. Move the handle and see the other visualizations change.",
			},
			{
				element: '#qualityMetrics',
				intro: 'The model quality metrics section will help you keep track of the interdependencies between recall, precision and false positive rate. Handle dragging interaction is supported.',
			},
			{
				element: '#preview',
				intro: "This section visualizes the classifier's performance by specifying the confusion matrix outputs. Increase and decrease directly by clicking and holding the buttons.",
			},
		],
	}

	setNewValues = (metric, metricValue, lastChangeByRadar) => {
		//lastChangeByRadar = true, false
		
		const data = this.props.data
		
		//find the closest existing value to the specified one
		//(metricValue is specified by the user by interacting with the visualizations)
		const definitiveValue = this.findClosestValue(metric, metricValue)
		
		//now find the index of an object (set of metric values)
		//that corresponds to the specified metric and its definitiveValue
		const indexOfDataObject = this.findWithAttr(data, metric, definitiveValue)

		//with that index, get the object
		const finalValues = data[indexOfDataObject]
		
		if (finalValues === undefined) {
			return false
		}

		//sometimes we might not need to rerender - that case gets intercepted here
		if(definitiveValue !== this.state.finalValues[metric]){
			
			//and save it to the state
			this.setState({
				finalValues: finalValues,
				metric: metric,
				metricValue: metricValue,
				lastChangeByRadar: lastChangeByRadar,
			})
			
		}
	}
	
	componentDidMount = () => {
		
		if(!this.state.didMountOnce) {
			
			this.setState({
				didMountOnce: true,
			}, () => { this.setNewValues('threshold',0.5) })
			
		}
	}
	
	findClosestValue = (metric, metricValue) => {
		
		const data = this.props.data
		
		//create array with all values of specified metric
		let metricArray = []
		for (let entry in data){
			
			metricArray.push(data[entry][metric])
			
		}
				
		//ascending sort
		metricArray.sort((a, b) => a - b)

		const lastElem = metricArray[metricArray.length-1]
		if (lastElem <= metricValue){
			
			return lastElem
			
		}
		
		for (let i in metricArray){
			
			//the wanted value of the specified metric exists
			if (metricArray[i] === metricValue) {
				
				return metricValue
				
			}
			
			//the wanted value does not exist
			else if (metricArray[i] > metricValue) {
				
				//find its closest neighbour and return it
				if (metricArray[i-1] !== 'undefined'){
					
					return metricArray[i]
					
				}
				else if (Math.abs(metricArray[i]-metricValue) <= Math.abs(metricArray[i-1]-metricValue)){
					
					return metricArray[i]
					
				}
				else{
					
					return metricArray[i-1]
					
				}
			}
		}
	}
	
	//find index of an object, in an array of objects, by the value of an attribute
	findWithAttr = (array, attr, value) => {
		
		for(let i = 0; i < array.length; i += 1) {
			
			if(array[i][attr] === value) {
				
				return i;
				
			}
		}
		
		return -1;
		
	}
	
	setNewThreshold = (thresholdValue) => {
		
		this.setNewValues('threshold', thresholdValue)
		
	}
	
	startTutorial = () => {
		this.setState({
			stepsEnabled: true,
		})
	}
	
	closeTutorial = () => {
		this.setState({
			stepsEnabled: false,
		})
	}
	
	render() {
		
		//note: metricValue does not contain a necessarily *existing* value for metric
		//the existing value is calculated in setNewValues() and then saved as part of finalValues
		
		const {
			finalValues, metric,
			metricValue, lastChangeByRadar, stepsEnabled, 
			steps, initialStep, 
		} = this.state
		
		/*We need finalValues, but with the currently handled value not changed to an actually existing one.
		This means that on the radar chart, we want to keep e.g. precision 0.349, even if the closest existing value
		is 0.35, because it would cause the handle to jump around a little on the radar otherwise.
		This does not influence the actual result or other values, as the original finalValues remains intact.*/
		
		let finalValuesRadar = finalValues
		if(lastChangeByRadar && finalValues[metric] !== metricValue){
			
			finalValuesRadar = {}
			finalValuesRadar[metric] = metricValue

			for (let m in finalValues){
				if(m !== metric){
					finalValuesRadar[m] = finalValues[m]
				}
			}
		}
		
		return (

			<div id='Visualizations'>
				
				{ finalValues ?
					
					<div id='BottomFlexContainer'>
						<Steps
							enabled={stepsEnabled}
							steps={steps}
							initialStep={initialStep}
							onExit={() => this.closeTutorial()}
						/>
						<div id='mainTitleAndButton'>
							<h2 className='title' id='mainTitle'>PreCall: ORES Human-Centered Model Selection</h2>
							<Button id='tutorialButton' onClick={() => this.startTutorial()}>i</Button>
						</div>
						<div id='metricsAndThreshold'>
							<div id='qualityMetrics'>
								<h2 className='title'>Model quality metrics</h2>
								<RadarChart finalValuesRadar={finalValuesRadar} displayValues={finalValues} callback={this.setNewValues}/>						
							</div>
							<div id='threshold'>
								<h2 className='title'>Threshold good / damaging</h2>
								<ThresholdBar threshold={finalValues['threshold']} callback={this.setNewValues} /> 
							</div>
						</div>
						<div id='preview'>
							<h2 className='title'>Expected classification result</h2>
							<ConfusionDistribution data={this.props.data} finalValues={finalValues} callback={this.setNewValues}/>
						</div>
					</div> : ''
				}
				
				{/*<div id='RadarInformation'>
					<MetricsShow finalValues={finalValues} numberOfColumns={2} styling={'SmallLabels'} thresholdWithout={true}/>
				</div>*/}
			</div>
		)
	}
}