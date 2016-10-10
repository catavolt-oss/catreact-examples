/**
 * Created by rburson on 2/8/16.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import { CatavoltPane, CvAppWindow, CvLoginPanel, CvGraphicalWorkbench, CvWorkbenchManager, CvNavigator, CvDropdownWorkbenchMenu, CvValueAdapter, CvLogout, CvStateChangeType, CvNavigationResultType, CvActionFiredResultType, CvMessagePanel } from '../../catreact';
import { Log, LogLevel } from 'catavolt-sdk';
Log.logLevel(LogLevel.DEBUG);
const CvReactBase = {
    componentWillMount: function () {
        this.waitProvider = new CvValueAdapter();
        this.waitListener = this.waitProvider.createValueListener();
        this.navPopupProvider = new CvValueAdapter();
        this.navPopupListener = this.navPopupProvider.createValueListener();
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    _showWaitState: function (event) {
        if (this.isMounted()) {
            if (event.eventObj.type === CvActionFiredResultType.ACTION_STARTED) {
                this.waitListener(true);
            }
            else if (event.eventObj.type === CvActionFiredResultType.ACTION_COMPLETED) {
                this.waitListener(false);
            }
        }
    },
};
/**
 * *********************************************************
 * Create a Catavolt root pane and top-level wrapper
 * *********************************************************
 */
const CvReactApp = React.createClass({
    mixins: [CvReactBase],
    render: function () {
        return (<div className="cv-container container-fluid">
                <CatavoltPane enableResourceCaching={true}>
                    {this.props.children}
                </CatavoltPane>
                <CvReactFooter />
            </div>);
    }
});
const CvReactFooter = React.createClass({
    render: function () {
        return <div className="cv-footer navbar navbar-fixed-bottom">
            <ul className="list-inline text-right">
                <li><a className="cv-target">About</a></li>
                <li><a className="cv-target">Contact</a></li>
            </ul>
        </div>;
    }
});
/**
 * *********************************************************
 * Create and configure a basic login panel
 * *********************************************************
 */
const CvReactLogin = React.createClass({
    mixins: [CvReactBase],
    getInitialState() {
        return { showDirectUrl: false, showGatewayUrl: false };
    },
    render: function () {
        return <div>
            <div className="cv-login-wrapper">
                <div className="cv-login-logo" onDoubleClick={this._toggleHiddenFields}></div>
                <CvLoginPanel defaultGatewayUrl={'gw.catavolt.net'} defaultTenantId={'solarsourcez'} defaultUserId={'sales'} showDirectUrl={this.state.showDirectUrl} showGatewayUrl={this.state.showGatewayUrl} showClientType={false} loginListeners={[(event) => {
                const windowId = event.resourceId; //get the session (window) from the LoginEvent
                this.context.router.replace('/workbench/' + windowId + '/' + '0');
            }]}/>
                <CvMessagePanel />
            </div>
       </div>;
    },
    _toggleHiddenFields: function (e) {
        if (e.shiftKey && e.ctrlKey) {
            this.setState({ showDirectUrl: !this.state.showDirectUrl, showGatewayUrl: !this.state.showGatewayUrl });
        }
    }
});
/**
 * *********************************************************
 * Create a 'window' top-level container, with a logout button
 * *********************************************************
 */
const CvReactWindow = React.createClass({
    mixins: [CvReactBase],
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        const logoutListener = () => { this.context.router.replace('/'); };
        return <CvAppWindow windowId={windowId} logoutListeners={[logoutListener]}>
                    <div className="cv-window">
                        <div className="cv-logo pull-left"/>
                        <CvMessagePanel />
                        <div className="cv-top-nav text-right">
                            <CvLogout renderer={(cvContext, callback) => {
            return <a className="cv-target" onClick={callback.logout}>Logout</a>;
        }} logoutListeners={[logoutListener]}/>
                        </div>
                        {this.props.children}
                    </div>
                </CvAppWindow>;
    }
});
/**
 * *********************************************************
 * Create a Workbench for the supplied window
 * *********************************************************
 */
const CvReactWorkbench = React.createClass({
    mixins: [CvReactBase],
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        let workbenchId = this.props.params.workbenchId; //get the workbench from the url param
        const selectionAdapter = new CvValueAdapter(); //the glue for our menu and workbench
        selectionAdapter.subscribe((workbench) => {
            this.context.router.replace('/workbench/' + windowId + '/' + workbench.workbenchId);
        });
        let workbenchEl = null;
        /**
         ****************************************************************
         * Example 1 - Graphical Workbench with a 'Dropdown' Menu
         ****************************************************************
         */
        //*
        const menuRenderer = () => {
            return <div className="col-sm-3 col-sm-offset-9 text-right">
                    <CvDropdownWorkbenchMenu workbenchSelectionListener={selectionAdapter.createValueListener()} initialSelectedWorkbenchId={workbenchId}/>
                </div>;
        };
        const workbenchRenderer = () => {
            return <CvGraphicalWorkbench initialWorkbenchId={workbenchId} numCols={3} actionListeners={[this._showWaitState]} launchListeners={[(launchEvent) => {
                    const navigationId = launchEvent.resourceId;
                    this.context.router.push('/navigator/' + windowId + '/' + navigationId);
                }]}/>;
        };
        workbenchEl = <CvWorkbenchManager menuRenderer={menuRenderer} workbenchRenderer={workbenchRenderer} selectionProvider={selectionAdapter}/>;
        //*/
        /**
         *********** End Example 1 ****************************************
         */
        /**
         ****************************************************************
         * Example 2 - Graphical Workbench with a 'Tabbed' Menu
         ****************************************************************
         */
        /*
            const menuRenderer = ()=>{
                return <div className="cv-workbench-tab-menu">
                    <CvTabbedWorkbenchMenu workbenchSelectionListener={selectionAdapter.createValueListener()} initialSelectedWorkbenchId={workbenchId}/>
                </div>;
            }

            const workbenchRenderer = ()=>{
                return <CvGraphicalWorkbench initialWorkbenchId={workbenchId} numCols={3}
                            actionListeners={[this._showWaitState]}
                            launchListeners={[(launchEvent:CvEvent<CvNavigationResult>)=>{
                                    const navigationId = launchEvent.resourceId;
                                    this.context.router.push('/navigator/' + windowId + '/' + navigationId);
                             }]}
                />
            }

            workbenchEl = <CvWorkbenchManager menuRenderer={menuRenderer} workbenchRenderer={workbenchRenderer} selectionProvider={selectionAdapter}/>
          */
        /**
         *********** End Example 2 ****************************************
         */
        /**
         ****************************************************************
         * Example 3 - Place a specific workbench (without menu)
         ****************************************************************
         */
        /*
            workbenchEl = <CvGraphicalWorkbench initialWorkbenchId="AAABACffAAAAAa6T" numCols={4}
                                actionListeners={[this._showWaitState]}
                                launchListeners={[(launchEvent:CvEvent<CvNavigationResult>)=>{
                                    const navigationId = launchEvent.resourceId;
                                    this.context.router.push('/navigator/' + windowId + '/' + navigationId);
                                 }]}
            />
         */
        /**
         *********** End Example 3 ****************************************
         */
        return (<div>
                {workbenchEl}
                <CvWaitPopup paramProvider={this.waitProvider}/>
            </div>);
    },
});
/**
 * *********************************************************
 * Create a Navigator for the supplied window
 * e.g. layoutOverrideElem={CvTabbedFormPanel}
 * or
 * layoutOverrideElem={CvVerticalLayoutFormPane} //mobile
 * *********************************************************
 */
const CvReactNavigator = React.createClass({
    mixins: [CvReactBase],
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        const currentNavId = this.props.params.navId;
        const router = this.context.router;
        return <div>
            <CvNavigator navigationId={currentNavId} navigationListeners={[(event) => {
                const nextNavigationId = event.resourceId;
                if (nextNavigationId) {
                    if (event.eventObj.type === CvNavigationResultType.FORM) {
                        if (event.eventObj.noTransition) {
                            this.navPopupListener(nextNavigationId);
                        }
                        else {
                            const target = '/navigator/' + windowId + '/' + nextNavigationId;
                            event.eventObj.sourceIsDestroyed ? router.replace(target) : router.push(target);
                        }
                    }
                    else if (event.eventObj.type === CvNavigationResultType.URL) {
                        window.open(event.eventObj.navRequest.webURL, '_blank');
                    }
                }
                else {
                    //force a refresh if there's no new resource (i.e. a NullNavigation)
                    router.replace('/navigator/' + windowId + '/' + currentNavId);
                }
            }]} actionListeners={[this._showWaitState]} stateChangeListeners={[(event) => {
                if (event.eventObj.type === CvStateChangeType.DESTROYED) {
                    router.goBack();
                }
            }]}/>
            <CvPopupNavigator paramProvider={this.navPopupProvider}/>
            <CvWaitPopup paramProvider={this.waitProvider}/>
        </div>;
    },
});
/**
    Component that overlays a 'wait' spinner, shown between navigations
 */
const CvWaitPopup = React.createClass({
    componentWillMount: function () {
        if (this.props.paramProvider) {
            this.props.paramProvider.subscribe(this._handleParamChange);
        }
    },
    getDefaultProps: function () {
        return { paramProvider: null };
    },
    getInitialState: function () {
        return { visible: false };
    },
    render: function () {
        return (<div className="modal" role="dialog" ref={(d) => {
            if (this.state.visible) {
                var m = $(d);
                if (m && m.modal) {
                    m.modal({ show: true, keyboard: false, backdrop: 'static' });
                }
            }
            else {
                var m = $(d);
                if (m && m.modal) {
                    m.modal('hide');
                }
            }
        }}>
                <div className="modal-dialog">
                    <div className="modal-body">
                        <div className="cv-wait-screen text-center">
                            <i className="fa fa-spinner fa-pulse fa-5x"/>
                        </div>
                    </div>
                </div>
            </div>);
    },
    _handleParamChange: function (visible) {
        this.setState({ visible: visible });
    },
});
const CvPopupNavigator = React.createClass({
    componentWillMount: function () {
        if (this.props.paramProvider) {
            this.props.paramProvider.subscribe(this._handleParamChange);
        }
    },
    getDefaultProps: function () {
        return { paramProvider: null };
    },
    getInitialState: function () {
        return { navigationId: null };
    },
    render: function () {
        return (<div className="modal" role="dialog" ref={(d) => {
            if (this.state.navigationId) {
                var m = $(d);
                if (m && m.modal) {
                    m.modal({ show: true, keyboard: false, backdrop: 'static' });
                }
            }
            else {
                var m = $(d);
                if (m && m.modal) {
                    m.modal('hide');
                }
            }
        }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-body">
                        <div className="cv-popup-nav-container">
                            {this.state.navigationId ?
            <CvNavigator navigationId={this.state.navigationId} navigationListeners={[(event) => {
                    const nextNavigationId = event.resourceId;
                    if (nextNavigationId) {
                        if (event.eventObj.type === CvNavigationResultType.FORM) {
                            this.setState({ navigationId: nextNavigationId });
                        }
                        else if (event.eventObj.type === CvNavigationResultType.URL) {
                            window.open(event.eventObj.navRequest.webURL, '_blank');
                        }
                    }
                }]} actionListeners={[]} stateChangeListeners={[(event) => {
                    //right now, any sort of state change closes the modal
                    //we could customize this more with delegate actions
                    this.setState({ navigationId: null });
                }]}/>
            : null}
                        </div>
                    </div>
                </div>
            </div>);
    },
    _handleParamChange: function (navigationId) {
        this.setState({ navigationId: navigationId });
    }
});
/**
 * *********************************************************
 * Wire things together with 'routes'
 * *********************************************************
 */
ReactDOM.render(<Router history={hashHistory}>
        <Route path="/" component={CvReactApp}>
            <IndexRoute component={CvReactLogin}/>
            <Route path="app" component={CvReactWindow}>
                <Route path="/workbench/:windowId/:workbenchId" component={CvReactWorkbench}/>
                <Route path="/navigator/:windowId/:navId" component={CvReactNavigator}/>
            </Route>
        </Route>
    </Router>, document.getElementById('cvApp'));
