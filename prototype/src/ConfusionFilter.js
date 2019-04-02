import React, { Component } from 'react'
import { Button, Input, Select } from 'semantic-ui-react'
import './styling/ConfusionFilter.css'

const options = [
	{ key: 'tn', text: 'TN', value: 'TN' },
	{ key: 'fp', text: 'FP', value: 'FP' },
	{ key: 'tp', text: 'TP', value: 'TP' },
	{ key: 'fn', text: 'FN', value: 'FN' },
]

export default class ConfusionFilter extends Component {
	
	state = {
		confOptParam: 'TN',
	}

	round = (a) => {
		return Number(Math.round(a+'e'+2)+'e-'+2)
	}
	
	calculateConfusion = () => {
		
		const data = this.props.data
		
		//arrays that will be saved to the state (once!)
		var allTPs = []
		var allFPs = []
		var allTNs = []
		var allFNs = []
		
		//thresholds[i] will represent the threshold to obtain allTPs[i], allFPs[i] etc.
		var thresholds = []
		
		for (var i=0; i < data.length; i++){

			//save threshold
			thresholds.push(data[i].threshold)

			//necessary constants
			const filters = this.round(100*data[i]['filter_rate'])
			const matches = this.round(100*data[i]['match_rate'])
					
			//calculate confusion values					
			const tp = this.round(matches*data[i]['precision'])
			const fp = this.round(matches-tp)
			const tn = this.round(filters*data[i]['!precision'])
			const fn = this.round(filters-tn)
			
			//fill arrays
			allTPs.push(tp)
			allFPs.push(fp)
			allTNs.push(tn)
			allFNs.push(fn)
		}
		
		this.setState({
			thresholds: thresholds,
			'allTPs': allTPs,
			'allFPs': allFPs,
			'allTNs': allTNs,
			'allFNs': allFNs,
		})
	}
	
	setConfusion = (confusionValue, wantedValue) => {
		
		//confusionValue = 'TP', 'FP', 'TN', 'FN'
		//wantedValue = 'max', 'min', int
		
		//get the full array of TPs, FPs, TNs or FNs from state, depending on what Button has been clicked
		const fullArray = eval('this.state.' + 'all' + confusionValue +'s')
		
		var wantedIndex
		var newThreshold
		
		if (wantedValue === 'max'){
			
			//get the maximum's index
			wantedIndex = fullArray.indexOf(this.arrayMax(fullArray))
						
		} else if (wantedValue === 'min'){
			
			//get the minimum's index
			wantedIndex = fullArray.indexOf(this.arrayMin(fullArray))
						
		} else if (this.isNumber(wantedValue)) {
			
			//user passed value in %
			var closest = Infinity
			wantedIndex = 0
			
			//find index of closest existing value to the one specified by user
			for (var i = 0; i < fullArray.length; i++){
				
				if (Math.abs(wantedValue - fullArray[i]) < Math.abs(wantedValue - closest)){
					
					closest = fullArray[i]
					wantedIndex = i
					
				}
			}
			
		} else {
			
			return 
			
		}
		
		newThreshold = this.state.thresholds[wantedIndex]
		this.props.callback('threshold',newThreshold)
	}
	
	pmConfusion = (confusionValue, plusMinus) => {
		
		//confusionValue = 'TP', 'FP', 'TN', 'FN'
		//plusMinus = '+', '-'
		
		//calculate current % of confusion value...
		const currentThreshold = this.props.currentThreshold
		const wantedIndex = this.state.thresholds.indexOf(currentThreshold)
		const fullArray = eval('this.state.' + 'all' + confusionValue +'s')
		const currentConfusion = fullArray[wantedIndex]
		
		//...and either add 1 to it
		if(plusMinus === '+'){
			
			this.setConfusion(confusionValue,currentConfusion+1)
			
		} 
		
		//...or subtract 1 from it
		else if (plusMinus === '-'){
			
			this.setConfusion(confusionValue,currentConfusion-1)	
			
		}
	}
	
	arrayMin = (arr) => {
		var len = arr.length, min = Infinity
			while (len--) {
				if (arr[len] < min) {
					min = arr[len]
				}
			}
		return min
	}
	
	arrayMax = (arr) => {
		var len = arr.length, max = -Infinity
			while (len--) {
				if (arr[len] > max) {
					max = arr[len]
				}
			}
		return max
	}
	
	isNumber = (n) => {
		return !isNaN(parseFloat(n)) && !isNaN(n - 0) 
	}

	handleChange = (e, { name, value }) => this.setState({ [name]: value })

	render () {
		
		const {confOptParam, confOptValue} = this.state
		
		if (!this.state.allTNs && !this.state.allFPs && !this.state.allTPs && !this.state.allFNs){
			this.calculateConfusion()	
		}		
		
		return (
			<div>
				{!this.props.buttonsOnly ?
					<div>
						<div>
							<Button color='blue' onClick={() => this.setConfusion('TN','max')}>Maximize TNs</Button>
							<Button color='red' onClick={() => this.setConfusion('FP','max')}>Maximize FPs</Button>
							<Button color='red' onClick={() => this.setConfusion('TP','max')}>Maximize TPs</Button>
							<Button color='blue' onClick={() => this.setConfusion('FN','max')}>Maximize FNs</Button>
						</div>
						<hr className='dividerClass'/>
						<div>
							<Button color='blue' onClick={() => this.setConfusion('TN','min')}>Minimize TNs</Button>
							<Button color='red' onClick={() => this.setConfusion('FP','min')}>Minimize FPs</Button>
							<Button color='red' onClick={() => this.setConfusion('TP','min')}>Minimize TPs</Button>
							<Button color='blue' onClick={() => this.setConfusion('FN','min')}>Minimize FNs</Button>
						</div>
						<hr className='dividerClass'/>
						<div>
							<Input name='confOptValue' onChange={this.handleChange} type='text' placeholder='Value in %' action>
								<input/>
								<Select compact options={options} defaultValue='TN' name='confOptParam' onChange={this.handleChange}/>
								<Button color='grey' type='submit' onClick={() => this.setConfusion(confOptParam,confOptValue)}>Optimize</Button>
							</Input>
						</div>
					</div>
					:
					<div className='plusMinusButtonGroup'>
						<Button.Group vertical>
							<Button onClick={() => this.pmConfusion(this.props.confusionValue,'+')}>+</Button>
							<Button onClick={() => this.pmConfusion(this.props.confusionValue,'-')}>-</Button>
						</Button.Group>
					</div>
				}
			</div>
		)
	}
}