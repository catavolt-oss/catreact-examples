/**
 * Created by rburson on 2/8/16.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import { Log, LogLevel } from 'catavolt-sdk';
import { CatavoltPane, CvAppWindow, CvValueAdapter, CvLogout, CvStateChangeType, CvNavigationResultType, CvActionFiredResultType } from 'catreact';
import { CvLoginPanel, CvGraphicalWorkbench, CvGraphicalWorkbenchPanel, CvNavigator, CvTabbedWorkbenchMenu, CvMessagePanel, CvDisplayProperties } from '../../catreact-html';
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
                this._showWait();
            }
            else if (event.eventObj.type === CvActionFiredResultType.ACTION_COMPLETED) {
                this._hideWait();
            }
        }
    },
    _showWait: function () {
        this.waitListener(true);
    },
    _hideWait: function () {
        this.waitListener(false);
    }
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
            </div>);
    }
});
const CvReactFooter = React.createClass({
    render: function () {
        return <div className={'cv-footer' + (this.props.fixed ? ' cv-footer-fixed' : '')}>
            <ul className="list-inline text-right">
                <li><a className="cv-target">&copy; Catavolt Inc. 2016</a></li>
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
    componentWillMount: function () {
        const tenantId = this.props.params.tenantId;
        if (!tenantId) {
            this.setState({ showDirectUrl: true, showGatewayUrl: true, showTenantId: true });
        }
    },
    getInitialState() {
        return { showDirectUrl: false, showGatewayUrl: false, showTenantId: false };
    },
    render: function () {
        const tenantId = this.props.params.tenantId;
        return <div>
            <div className="cv-login-wrapper">
                <div className="cv-login-logo" onDoubleClick={this._toggleHiddenFields}></div>
                <CvLoginPanel defaultGatewayUrl={'www.catavolt.net'} defaultTenantId={tenantId} showDirectUrl={this.state.showDirectUrl} showGatewayUrl={this.state.showGatewayUrl} showTenantId={this.state.showTenantId} showClientType={false} actionListeners={[this._showWaitState]} loginListeners={[(event) => {
                const windowId = event.resourceId; //get the session (window) from the LoginEvent
                this.context.router.replace('/workbench/' + windowId + '/' + '0');
            }]}/>
                <CvMessagePanel />
            </div>
            <CvWaitPopup paramProvider={this.waitProvider}/>
            <CvReactFooter fixed={true}/>
       </div>;
    },
    _toggleHiddenFields: function (e) {
        if (e.shiftKey && e.ctrlKey) {
            this.setState({ showDirectUrl: !this.state.showDirectUrl, showGatewayUrl: !this.state.showGatewayUrl, showTenantId: !this.state.showTenantId });
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
        const workbenchId = this.props.params.workbenchId; //get the workbench from the url param
        const logoutListener = (event) => { this.context.router.replace('/' + event.eventObj.tenantId); };
        return <CvAppWindow windowId={windowId} logoutListeners={[logoutListener]} renderer={(cvContext, callback) => {
            let [userId, tenantId] = ['', ''];
            if (callback.getAppContext().sessionContextTry.isSuccess) {
                userId = callback.getAppContext().sessionContextTry.success.userName;
                tenantId = callback.getAppContext().sessionContextTry.success.tenantId;
            }
            return <div className="cv-window" ref={(r) => { document.title = tenantId; }}>
                                            <div className="cv-logo pull-left"/>
                                            <CvMessagePanel />
                                            <div className="cv-top-nav text-right">
                                                <CvLogout renderer={(cvContext, callback) => {
                return <a className="cv-target" onClick={callback.logout}>Logout</a>;
            }} logoutListeners={[logoutListener]}/>
                                                <span className="cv-user-id">({userId})</span>
                                            </div>
                                            <div className="clearfix"/>
                                            <CvReactNavMenu windowId={windowId} workbenchId={workbenchId} path={this.props.location ? this.props.location.pathname : null}/>
                                            {this.props.children}
                                </div>;
        }}/>;
    }
});
/**
 * *********************************************************
 * Create a NavMenu or the supplied window
 * *********************************************************
 */
const CvReactNavMenu = React.createClass({
    mixins: [CvReactBase],
    render: function () {
        const windowId = this.props.windowId;
        let workbenchId = this.props.workbenchId;
        const path = this.props.path;
        const selectionAdapter = new CvValueAdapter(); //the glue for our menu and workbench
        selectionAdapter.subscribe((workbench) => {
            this.context.router.push('/workbench/' + windowId + '/' + workbench.workbenchId);
        });
        return <div className="cv-workbench-navbar cv-comp-bg-color1">
            {path && (path.substr(0, 11) === '/navigator/') ?
            <div className="cv-back-nav pull-left">
                        <span className="glyphicon glyphicon-triangle-left" aria-hidden="true"/>
                        <a className="cv-target" onClick={() => { this.context.router.goBack(); }}>Prev</a>
                    </div>
            : null}
            <div className="cv-workbench-tab-menu">
                    <CvTabbedWorkbenchMenu workbenchSelectionListener={selectionAdapter.createValueListener()} initialSelectedWorkbenchId={workbenchId}/>
            </div>
        </div>;
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
        const workbenchEl = <CvGraphicalWorkbenchPanel workbenchId={workbenchId} workbenchRenderer={(workbench) => <CvGraphicalWorkbench workbench={workbench} numCols={3} actionListeners={[this._showWaitState]} launchListeners={[(launchEvent) => {
                const navigationId = launchEvent.resourceId;
                this.context.router.push('/navigator/' + windowId + '/' + workbenchId + '/' + navigationId);
            }]}/>}/>;
        return (<div>
                {workbenchEl}
                <CvWaitPopup paramProvider={this.waitProvider}/>
                <CvReactFooter fixed={true}/>
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
    componentDidMount() {
        this.context.router.setRouteLeaveHook(this.props.route, this._hideWait);
    },
    render: function () {
        const windowId = this.props.params.windowId; //get the window from the url param
        const workbenchId = this.props.params.windowId; //get the workbenchId from the url param
        const currentNavId = this.props.params.navId;
        const currentDisplayProps = this.props.params.displayProps ?
            CvDisplayProperties.deserializeProperties(this.props.params.displayProps) : new CvDisplayProperties();
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
                            const target = '/navigator/' + windowId + '/' + workbenchId + '/' + encodeURIComponent(nextNavigationId);
                            event.eventObj.sourceIsDestroyed ? router.replace(target) : router.push(target);
                        }
                    }
                    else if (event.eventObj.type === CvNavigationResultType.URL) {
                        window.open(event.eventObj.navRequest.webURL, '_blank');
                    }
                }
                else {
                    //force a refresh if there's no new resource (i.e. a NullNavigation)
                    router.replace('/navigator/' + windowId + '/' + workbenchId + '/' + encodeURIComponent(currentNavId));
                }
            }]} actionListeners={[this._showWaitState]} stateChangeListeners={[(event) => {
                if (event.eventObj.type === CvStateChangeType.DESTROYED) {
                    router.goBack();
                }
            }]} displayProperties={currentDisplayProps} displayPropChangeListeners={[(updatedDisplayProps) => {
                router.replace('/navigator/' + windowId + '/' + workbenchId + '/'
                    + encodeURIComponent(currentNavId) + '/' + encodeURIComponent(updatedDisplayProps.serializeProperties()));
            }]}/>
            <CvPopupNavigator paramProvider={this.navPopupProvider}/>
            <CvWaitPopup paramProvider={this.waitProvider}/>
            <CvReactFooter fixed={true}/>
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
                            <i className="fa fa-spinner fa-pulse cv-spinner-size"/>
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
            <Route path="/:tenantId" component={CvReactLogin}/>
            <Route path="app" component={CvReactWindow}>
                <Route path="/workbench/:windowId/:workbenchId" component={CvReactWorkbench}/>
                <Route path="/navigator/:windowId/:workbenchId/:navId(/:displayProps)" component={CvReactNavigator}/>
            </Route>
        </Route>
    </Router>, document.getElementById('cvApp'));
