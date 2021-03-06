import {Component, PropTypes} from 'react'

import {Tabs, Tab} from 'material-ui/Tabs'
import Table from 'react-bootstrap/lib/Table'
import SwipeableViews from 'react-swipeable-views'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {tagSelectedAction} from '../../store/tagSelectedAction'
import FlatButton from 'material-ui/FlatButton'


const FLAGS_LIST = [
	{time_in: '00:00:03:07', time_out: '00:00:03:07' , type: 'car', category: 'Objects'},
	{time_in: '00:00:03:07', time_out: '00:00:03:07' , type: 'car', category: 'Objects'},
	{time_in: '00:00:03:07', time_out: '00:00:03:07' , type: 'car', category: 'Objects'},
	{time_in: '00:00:03:07', time_out: '00:00:03:07' , type: 'car', category: 'Objects'},
	{time_in: '00:00:03:07', time_out: '00:00:03:07' , type: 'car', category: 'Objects'}
]

const TABS_LIST = [
	'Tags',
	'Info'
]

const inactiveStyle = {
	backgroundColor: '#D7D7D7',
	color: '#5A5A5A'
}

class VideoDetails extends Component {
	state = {
		tabIndex: 0
	};

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	switchTabs = (tabIndex)=> {
		this.setState({tabIndex})
	}

	toHome = ()=> {
		this.context.router.push('/')
	}

    handleRowClick = (row)=> {
        this.props.tagSelectedAction(row)
    }


    render(){
		var {className} = this.props;
		var cx = `${className || ''} video-details-container`

		return (
			<div className={cx}>
				<div className='tabbed-section'>
					<Tabs
						value={this.state.tabIndex}
						onChange={this.switchTabs}>
						{
							TABS_LIST.map((x,i)=> (
								<Tab label={x} value={i} key={i} style={ this.state.tabIndex !== i ? inactiveStyle : {} } onClick={this.handleClick}/>
							))
						}
					</Tabs>
					<div className='tab-content'>
						<SwipeableViews
							index={this.state.tabIndex}
							onChangeIndex={this.switchTabs}
							containerStyle={{width: '100%', height: '100%'}}
							style={{width: '100%', height: '100%'}}>
							{this.props.children}
							<div>
								<div className="detail-div">
									<h4>Video Info</h4>
								</div>
								<div id="tile-div" className="detail-div">
									<h4>Title</h4>
									<h4>{this.props.video_file_selected.videoName}</h4>
								</div>
								<div className="detail-div">
									<h4>Uploaded on</h4>
									<h4>17-02-2017</h4>
								</div>
								<div className="detail-div">
									<h4>Duration</h4>
									<h4>{this.props.video_file_selected.videoDuration}</h4>
								</div>
								<div className="detail-div">
									<h4>Dimensions</h4>
									<h4>{this.props.video_file_selected.video_width + "X" + this.props.video_file_selected.video_height}</h4>
								</div>
								<div className="detail-div">
									<h4>Frame-rate</h4>
									<h4>{this.props.video_file_selected.frame_rate}</h4>
								</div>
							</div>
						</SwipeableViews>
					</div>

				</div>
				<div className='comments-section'>
					<div className='flex-vertical'>
						<textarea id='comments-input' placeholder='Comments'/>
						<div className='comments-footer'>
							<FlatButton
								label='SUBMIT'
								onClick={this.toHome}
								style={{
									backgroundColor: '#D7D7D7',
									borderRadius: 0,
									height: '36px',
									paddingLeft: '16px',
									paddingRight: '16px',
								}}/>

						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
    return {
        // tags: state.tagReducer,
        marker_store:state.markerReducer,
		video_file_selected: state.VideoFileSelectedReducer
    };
};
function matchDispatchToProps(dispatch) {
    return bindActionCreators({tagSelectedAction: tagSelectedAction}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(VideoDetails);