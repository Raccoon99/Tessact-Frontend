import Promise from 'bluebird'
import {Component, PropTypes} from 'react'
import {browserHistory} from 'react-router'
import {connect} from 'react-redux'
import $ from 'jquery'
import 'bootstrap'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import c from './NewUploadPageStyle.css'
import {actions} from 'store/Data'
import AddFileButton from './AddFileButton'
import FlatButton from 'material-ui/FlatButton'
import {ORANGE} from 'utils/colors'

import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import {searchOptionChangedAction} from '../../store/searchOptionChangedAction'


const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    gridList: {
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
    },
    titleStyle: {
        color: 'rgb(0, 188, 212)',
    },
};

const x = "https://triggerbackendnormal.blob.core.windows.net/backend-media/b7712b36-4975-48dd-929f-4cced4afabb0.jpg"

class NewUploadPage extends Component {

    state = {
        items: [],
        assignIsOpen: false,
        fileUploadIsOpen: false,
        loadingIsOpen: false,
        imageURLS: [x,x,x,x,x,x,x]
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }


    componentDidMount(){
        $(document).ready(function () {
            var $myModal = $('#myModal');

            $('.row img.img-responsive').on('click', function () { // <-- notice the selector change
                var $this = $(this),
                    src = $this.attr('src'),

                    html = '<img src="' + src + '" class="img-responsive" />';
                updateModalBody($myModal, html);

                $myModal.modal();

            });

            $myModal.on('hidden.bs.modal', function () {
                updateModalBody($myModal, '');
            });

            function updateModalBody($modal, html) {
                $modal.find('.modal-body').html(html);
            }
        })
    }
    onRowSelection = (selected) => {
        console.log('Selected rows: ', selected)
        this.props.selectRows(selected)
    }

    onSubmitProcess = () => {
        this.props.selectedRows.forEach(rowIndex => {
            var $row = $('.table-item-' + rowIndex);
            var $process = $row.find('.process-column')

            // If already processed return
            if (!$process.empty()) {
                return
            }

            this.createProcessAnimation($process);

        })
        console.log('Process submitted')
    }






    createProcessAnimation = ($el) => {
        var $progress = $('<div/>', {class: 'ui-progress-bar'});
        var $bar = $('<div/>', {class: 'ui-bar'});
        $bar.css('width', '0%');
        $progress.append($bar)

        $el.append($progress);
        $bar.stop().animate({width: '100%'}, 4000, function () {
            $el.empty().html('<img class="img-green-tick" src="/public/img/green-check.png"/>')
        });
    }

    toggleAssign = () => {
        this.setState({
            assignIsOpen: !this.state.assignIsOpen
        })
    }

    openFileUpload() {
        this.setState({
            fileUploadIsOpen: !this.state.fileUploadIsOpen
        })
    }

    openLoading() {
        this.setState({
            loadingIsOpen: !this.state.loadingIsOpen
        })
    }

    updateImageURLS(url_array) {
        //localStorage.setItem( 'imageURLS', JSON.stringify(url_array) );
        this.setState({
            imageURLS: url_array
        })
        //this.componentWillUpdate();

    }

    setCurrentItem = (item) => {
        this.props.setCurrentItem(item);
        //this.context.router.push('/test-video-page')
        this.context.router.push('/tagging-video-page')
        //this.context.router.push('/video-screen')
    }

    toGroups = () => {
        this.context.router.push('/groups')
    }


    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    {this.state.imageURLS.map((x,i) => (
                        <div className="col-lg-2 col-md-4 col-sm-4 col-xs-6 image-div">
                            <img className="img-responsive" src={x} alt="" />
                        </div>
                    ))}

                <div className="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body"></div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

        )
    }
}


const mapStateToProps = (state) => ({
    //list: state.Data.list,
    selectedRows: state.Data.selectedRows,
    auth_token: state.Data.auth_token,
    search_option_changed_reducer: state.searchOptionChangedReducer
})

const mapDispatchToProps = (dispatch) => ({
    selectRows(ids){
        return dispatch(actions.selectRows(ids))
    },
    setCurrentItem(item){
        return dispatch(actions.setCurrentItem(item))
    },
    setAuthToken(item){
        return dispatch(actions.setCurrentItem(item))
    }
})


export default connect(mapStateToProps, mapDispatchToProps)(NewUploadPage)
