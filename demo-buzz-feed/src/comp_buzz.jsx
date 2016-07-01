/**
 * Created by rburson on 2/8/16.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import { CatavoltPane, CvAppWindow, CvWorkbench, CvScope, CvLauncher, CvNavigation, CvForm, CvListPane, CvDetailsPane, CvRecord, CvRecordList, CvProp, CvResource, CvAction, CvLoginPanel, CvValueAdapter } from '../../catreact';
import { Log, LogLevel } from 'catavolt-sdk';
Log.logLevel(LogLevel.DEBUG);
const BuzzBase = {
    contextTypes: {
        router: React.PropTypes.object
    },
};
const BuzzApp = React.createClass({
    mixins: [BuzzBase],
    render: function () {
        return (<div className="container">
                <CatavoltPane enableResourceCaching={true}>
                    <div>
                        <div className="header"></div>
                        {this.props.children}
                    </div>
                </CatavoltPane>
            </div>);
    }
});
const BuzzLogin = React.createClass({
    mixins: [BuzzBase],
    render: function () {
        return <CvLoginPanel defaultGatewayUrl={'gw.catavolt.net'} defaultTenantId={'catavolt-dev'} defaultUserId={'rob'} defaultPassword={'rob123'} showGatewayUrl={false} showClientType={false} loginListeners={[(event) => {
                const sessionId = event.resourceId; //get the session from the LoginEvent
                this.context.router.push('/workbench/' + sessionId);
            }]}/>;
    }
});
/*
    Sets up a buzz workbench with one launcher for 'streams'
 */
const BuzzWorkbench = React.createClass({
    mixins: [BuzzBase],
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        return (<CvAppWindow windowId={windowId}>
                <span>
                    <CvWorkbench workbenchId={"AAABACffAAAABpZL"}>
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <h3 className="panel-title">
                                    <CvScope get={'name'}/>
                                </h3>
                            </div>
                            <div className="panel-body row">
                                <CvLauncher actionId={"AAABACfaAAAABpIk"} launchListeners={[(launchEvent) => {
                const navigationId = launchEvent.resourceId;
                this.context.router.push('/buzzstream/' + windowId + '/' + navigationId);
            }]} renderer={(cvContext, callback) => {
            const launcher = cvContext.scopeCtx.scopeObj;
            return (<div onClick={callback.fireLaunchAction} className="col-sm-8 launch-div">
                                            <img className="launch-icon img-responsive center-block" src={launcher.iconBase}/>
                                            <h4 className="launch-text small text-center">{launcher.name}</h4>
                                        </div>);
        }}/>
                            </div>
                        </div>
                    </CvWorkbench>
                </span>
            </CvAppWindow>);
    }
});
/*
    Component that shows the 'streams' list
 */
const BuzzStream = React.createClass({
    mixins: [BuzzBase],
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        const navigationId = this.props.params.navigationId;
        return (<CvAppWindow windowId={windowId}>
                <span>
                    <CvNavigation persistent={false} navigationId={navigationId}>
                        <CvForm>
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h4>
                                        <CvScope get={'paneTitle'}/>
                                    </h4>
                                </div>
                                <div style={{ maxHeight: '800px', overflow: 'auto' }}>
                                    <ul className={'list-group'}>
                                        <CvListPane paneRef={0}>
                                            <CvRecordList wrapperElemName={'span'} rowRenderer={(cvContext, record) => {
            const listContext = cvContext.scopeCtx.scopeObj;
            //select "this record" so that the action can find the target via the selectionProvider
            const selectionAdapter = new CvValueAdapter();
            selectionAdapter.createValueListener()([record.objectId]);
            return (<CvRecord entityRec={record} key={record.objectId}>
                                                        <CvAction actionId={listContext.listDef.defaultActionId} paneContext={listContext} navigationListeners={[(navEvent) => {
                    const navigationId = navEvent.resourceId;
                    this.context.router.push('/buzzmessages/' + windowId + '/' + navigationId);
                }]} selectionProvider={selectionAdapter} wrapperElemName="li" wrapperElemProps={{ className: "list-group-item" }}>
                                                                        <CvProp propName={'name'}/>
                                                                    </CvAction>
                                                    </CvRecord>);
        }}/>
                                        </CvListPane>
                                    </ul>
                                </div>
                            </div>
                        </CvForm>
                    </CvNavigation>
                </span>
            </CvAppWindow>);
    }
});
/*
    Component that shows the buzz 'Messages' list and allows for posting
 */
const BuzzMessages = React.createClass({
    mixins: [BuzzBase],
    getInitialState: function () {
        return { openNewMessageFormResult: null };
    },
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        const navigationId = this.props.params.navigationId;
        return (<CvAppWindow windowId={windowId}>
                <span>
                    <CvNavigation navigationId={navigationId} persistent={true}>
                        <CvForm>
                            <CvListPane paneRef={0}>
                                <div className="panel panel-primary">
                                    <div className="panel-heading">
                                        <i id={'loading'} className="fa fa-spinner fa-pulse fa-2x pull-right show"/>
                                        <h4>Messages</h4>
                                        <div className="messageToolbar text-right">
                                            <CvAction actionId={'alias_createMessage'} navigationListeners={[(e) => {
                this.setState({ openNewMessageFormResult: e.eventObj });
            }]} actionListeners={[(e) => {
                $('#loading').addClass('show').removeClass('hidden');
            }]}>
                                                <span>
                                                    <CvResource resourceName={'icon-action-join.png'}/>
                                                    <a className="hlText">New Message</a>
                                                </span>
                                            </CvAction>
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: '800px', overflow: 'auto' }}>
                                        <div className="messageCol">
                                            <CvRecordList wrapperElemName={"span"} rowRenderer={(cvContext, record) => {
            $('#loading').addClass('hidden').removeClass('show');
            return (<CvRecord entityRec={record} key={record.objectId}>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <div className="messagePanel">
                                                            <div className="row">
                                                                <div className="col-sm-6">
                                                                    <div className="row">
                                                                        <div className="col-sm-2">
                                                                            <CvProp propName={'avatar_large'} className={'img-rounded avatar'}/>
                                                                        </div>
                                                                        <div className="col-sm-4 text-center attrib-box">
                                                                            <h4> <CvProp propName={'created-by'}/> </h4>
                                                                            <small> <CvProp propName={'group_name'}/> </small>
                                                                            <small className="text-muted"> <CvProp propName={'created-at'}/> </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    <div className="pull-right">
                                                                        <CvProp propName={'is_flagged'} handler={(prop) => {
                return prop.value ?
                    <CvResource resourceName={'icon-bookmark.png'} style={{ width: 24, height: 38 }}/> :
                    <CvResource resourceName={'icon-bookmark-unchecked.png'} style={{ width: 24, height: 38 }}/>;
            }}/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="like-row">
                                                                <span> <CvProp propName={'likes_count'}/> </span>
                                                                <span>liked</span> <span /> <span />
                                                                <span> <CvProp propName={'comments_count'}/> </span>
                                                                <span>comments</span>
                                                            </div>
                                                            <div> <div> <CvProp propName={'title'}/> </div>
                                                                <blockquote> <p> <CvProp propName={'body_preview'}/> </p> </blockquote>
                                                                <div className="text-center">{function () {
                const attachments = [];
                for (let i = 1; i <= 10; i++) {
                    attachments.push(<CvProp propName={'attachment_preview_' + i} key={'' + i}/>);
                }
                return attachments;
            }()}
                                                                </div>
                                                            </div>
                                                            <div className="badge-row">
                                                                <div className="text-right">
                                                                    <CvProp propName={'deletable'} handler={(prop) => {
                return prop.value ?
                    <CvResource resourceName={'icon-humana-delete.png'} style={{ width: 20, height: 20, marginRight: 5 }}/>
                    : null;
            }}/>
                                                                    <CvResource resourceName={'icon-action-comment.png'} style={{ width: 24, height: 24 }}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CvRecord>);
        }}/>
                                        </div>
                                    </div>
                                </div>
                            </CvListPane>
                        </CvForm>
                    </CvNavigation>
                    <BuzzPostMessage navigationResult={this.state.openNewMessageFormResult}/>
                </span>
            </CvAppWindow>);
    }
});
const BuzzPostMessage = React.createClass({
    mixins: [BuzzBase],
    getDefaultProps: function () {
        return { navigationResult: null };
    },
    render: function () {
        return (<CvNavigation navigationResult={this.props.navigationResult}>
                        <CvForm>
                            <CvDetailsPane paneRef={0} detailsRenderer={(cvContext, record, detailsCallback) => {
            return (<CvRecord entityRec={record} renderer={(cvContext) => {
                const entityRec = cvContext.scopeCtx.scopeObj;
                const eventRegistry = cvContext.eventRegistry;
                const maxAttachments = 4;
                var numAttachments = 0;
                const propChange = (fieldName, e) => {
                    detailsCallback.setPropValue(fieldName, e.target.value);
                };
                const imageChange = (fieldName, e) => {
                    numAttachments++;
                    if (numAttachments > maxAttachments) {
                        alert('4 is the maximum number of attachments.');
                    }
                    else {
                        if (e.target.files) {
                            const files = e.target.files;
                            if (files[0]) {
                                var fr = new FileReader();
                                fr.onload = function (e) {
                                    const propName = fieldName + numAttachments;
                                    const imgEl = $('#' + propName + '_preview');
                                    const dataUrl = e.target.result;
                                    imgEl.attr("src", dataUrl);
                                    detailsCallback.setBinaryPropWithDataUrl(propName, dataUrl);
                                };
                                fr.readAsDataURL(files[0]);
                            }
                        }
                    }
                };
                const onSubmit = (e) => {
                    e.preventDefault();
                    $('#loading').addClass('show').removeClass('hidden');
                    detailsCallback.saveChanges((navEvent, error) => {
                        if (error) {
                            $('#loading').addClass('hidden').removeClass('show');
                            Log.error(error);
                        }
                        else {
                            if (navEvent)
                                Log.info("There was a navigation.");
                            var m = $('#postModal');
                            if (m && m.modal) {
                                m.modal('hide');
                            }
                        }
                    });
                };
                return (<form className="form-horizontal" onSubmit={onSubmit}>
                                        <div className="modal fade" role="dialog" id="postModal" ref={(d) => {
                    var m = $(d);
                    if (m && m.modal) {
                        m.modal({ show: true, keyboard: true });
                    }
                    $('#loading').addClass('hidden').removeClass('show');
                }}>
                                          <div className="modal-dialog">
                                            <div className="modal-content">
                                              <div className="modal-header">
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                                <h4 className="modal-title">Post A New Message</h4>
                                              </div>
                                              <div className="modal-body">
                                                    <div className="well">
                                                        <div className="form-group">
                                                            <label htmlFor="messageBody" className="col-sm-3 control-label small">Message:</label>
                                                            <div className="col-sm-9">
                                                                 <textarea className="form-control" id="messageBody" onBlur={propChange.bind(this, 'P_body')}/>
                                                             </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="image1" className="col-sm-3 control-label small">Add attachment: </label>
                                                            <div className="col-sm-9">
                                                                <input id="image1" type="file" className="form-control" onChange={imageChange.bind(undefined, 'P_image')}/>
                                                                 <br />
                                                                <div><img className="image-attachments center-block img-rounded" id={'P_image1_preview'}/></div>
                                                                <div><img className="image-attachments center-block img-rounded" id={'P_image2_preview'}/></div>
                                                                <div><img className="image-attachments center-block img-rounded" id={'P_image3_preview'}/></div>
                                                                <div><img className="image-attachments center-block img-rounded" id={'P_image4_preview'}/></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                              </div>
                                              <div className="modal-footer">
                                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                                <button type="submit" className="btn btn-primary">Post <span className="glyphicon glyphicon-log-in" aria-hidden="true"/></button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                    </form>);
            }}/>);
        }}/>
                        </CvForm>
                    </CvNavigation>);
    }
});
ReactDOM.render(<Router history={hashHistory}>
        <Route path="/" component={BuzzApp}>
            <IndexRoute component={BuzzLogin}/>
            <Route path="/workbench/:windowId" component={BuzzWorkbench}/>
            <Route path="/buzzstream/:windowId/:navigationId" component={BuzzStream}/>
            <Route path="/buzzmessages/:windowId/:navigationId" component={BuzzMessages}/>
        </Route>
    </Router>, document.getElementById('cvApp'));
