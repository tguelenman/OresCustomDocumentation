import React, { Component } from 'react'
import './styling/ConfusionDistribution.css'
import ConfusionFilter from './ConfusionFilter.js'

export default class ConfusionDistribution extends Component {

	round = (a) => {
		return Number(Math.round(a+'e'+2)+'e-'+2)
	}
		
	render() {

		const finalValues = this.props.finalValues
						
		let tPContent = []
		let fNContent = []
		let tNContent = []
		let fPContent = []

		let tp, fp, tn ,fn

		if(finalValues) {
				
			//Calculate TN/FN/TP/FP	in %	
			const filters = this.round(100*finalValues['filter_rate'])
			const matches = this.round(100*finalValues['match_rate'])
									
			tp = this.round(matches*finalValues['precision'])
			fp = this.round(matches-tp)
			tn = this.round(filters*finalValues['!precision'])
			fn = this.round(filters-tn)
			
			/***fill containers with bubbles and triangles***/
			//TPs
			//fill with colored shapes
			for (var index = 0; tp-index > 0.5; index++){
				tPContent.push(<div className='triangle' key={'tp'+index.toString()}><div className='tp innerTriangle'/></div>)
			}

			//fill up the rest with empty shapes			
			for (index; index < 100; index++){
				tPContent.push(							
					<div className='triangle'>
						<div className='innerTriangle legendTriangle' key={'tp'+index.toString()+'empty'}/>
					</div>
				)
			}

			//FNs
			//fill with colored shapes
			for (index = 0; fn-index > 0.5; index++){
				fNContent.push(<div className='triangle' key={'fn'+index.toString()}><div className='fn innerTriangle'/></div>)
			}
			
			//fill up the rest with empty shapes
			for (index; index < 100; index++){
				fNContent.push(							
					<div className='triangle'>
						<div className='innerTriangle legendTriangle' key={'fn'+index.toString()+'empty'}/>
					</div>
				)
			}
			
			//TNs
			//fill with colored shapes
			for (index = 0; tn-index > 0.5; index++){
				tNContent.push(<div className='bubble tn' key={'tn'+index.toString()}></div>)
			}
			
			//fill up the rest with empty shapes
			for (index; index < 100; index++){
				tNContent.push(<div className='bubble' key={'tn'+index.toString()+'empty'}/>)
			}

			//FPs
			//fill with colored shapes			
			for (index = 0; fp-index > 0.5; index++){
				fPContent.push(<div className='bubble fp' key={'fp'+index.toString()}></div>)
			}
			
			//fill up the rest with empty shapes
			for (index; index < 100; index++){
				fPContent.push(<div className='bubble' key={'fp'+index.toString()+'empty'}/>)
			}
		}
		
		return (
			<div id='DistributionDiv'>
				<div className='outerBubbleContainer'>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'TN'}
						buttonType={'-'}
					/>
					<div id='trueNegatives' className='bubbleContainer'>
						{tNContent}
						<div className='bubbleLabeling'>
							<p className='bubbleP bubbleValueP'>{tn}%</p>
							<p className='bubbleP'>correctly</p>
							<p className='bubbleP'>detected as</p>
							<p className='bubbleP bubblePGood'>good</p>
						</div>
					</div>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'TN'}
						buttonType={'+'}
					/>
				</div>
				<div className='outerBubbleContainer'>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'FP'}
						buttonType={'-'}
					/>
					<div id='falsePositives' className='bubbleContainer'>
						{fPContent}
						<div className='bubbleLabeling'>
							<p className='bubbleP bubbleValueP'>{fp}%</p>
							<p className='bubbleP'>wrongly</p>
							<p className='bubbleP'>detected as</p>
							<p className='bubbleP bubblePDamaging'>damaging</p>
						</div>
					</div>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'FP'}
						buttonType={'+'}
					/>
				</div>
				<div className='outerBubbleContainer'>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'TP'}
						buttonType={'-'}
					/>
					<div id='truePositives' className='bubbleContainer'>
						{tPContent}
						<div className='bubbleLabeling'>
							<p className='bubbleP bubbleValueP'>{tp}%</p>
							<p className='bubbleP'>correctly</p>
							<p className='bubbleP'>detected as</p>
							<p className='bubbleP bubblePDamaging'>damaging</p>
						</div>
					</div>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'TP'}
						buttonType={'+'}
					/>
				</div>
				<div className='outerBubbleContainer'>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'FN'}
						buttonType={'-'}
					/>
					<div id='falseNegatives' className='bubbleContainer'>
						{fNContent}
						<div className='bubbleLabeling'>
							<p className='bubbleP bubbleValueP'>{fn}%</p>
							<p className='bubbleP'>wrongly</p>
							<p className='bubbleP'>detected as</p>
							<p className='bubbleP bubblePGood'>good</p>
						</div>
					</div>
					<ConfusionFilter data={this.props.data} 
						callback={this.props.callback} 
						currentThreshold={finalValues['threshold']} 
						confusionValue={'FN'}
						buttonType={'+'}
					/>
				</div>
			</div>
		)
	}
}