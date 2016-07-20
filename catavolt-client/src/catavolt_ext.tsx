/**
 * Created by rburson on 2/8/16.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Router, Route, hashHistory, IndexRoute} from 'react-router'
import {
    CatavoltPane,
    CvAppWindow,
    CvEvent,
    CvContext,
    CvLogoutCallback,
    CvLoginResult,
    CvNavigationResult,
    CvLoginPanel,
    CvGraphicalWorkbench,
    CvWorkbenchManager,
    CvNavigator,
    CvDropdownWorkbenchMenu,
    CvTabbedWorkbenchMenu,
    CvValueAdapter,
    CvValueProvider,
    CvValueListener,
    CvLogout,
    CvStateChangeResult,
    CvStateChangeType,
    CvNavigationResultType,
    CvVerticalLayoutFormPane,
    CvTabbedFormPanel,
    CvActionFiredResult,
    CvActionFiredResultType,
    CvMessagePanel
} from '../../catreact'

import {Log, LogLevel, Workbench, WebRedirection} from 'catavolt-sdk'

Log.logLevel(LogLevel.DEBUG);

const CvReactBase = {
    
    componentWillMount: function () {
        this.waitProvider = new CvValueAdapter<boolean>();
        this.waitListener = this.waitProvider.createValueListener();
        this.navPopupProvider = new CvValueAdapter<string>();
        this.navPopupListener = this.navPopupProvider.createValueListener();
    },

    contextTypes: {
        router: React.PropTypes.object
    },
    
    _showWaitState: function(event:CvEvent<CvActionFiredResult>) {
        if(this.isMounted()) {
            if(event.eventObj.type === CvActionFiredResultType.ACTION_STARTED) {
                this.waitListener(true);
            } else if(event.eventObj.type === CvActionFiredResultType.ACTION_COMPLETED) {
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
        return (
            <div className="cv-container container-fluid">
                <CatavoltPane enableResourceCaching={true}>
                    {this.props.children}
                </CatavoltPane>
                <CvReactFooter/>
            </div>
        );
    }
});

const CvReactFooter  = React.createClass({
   
    render: function () {
        return <div className="cv-footer navbar navbar-fixed-bottom">
            <ul className="list-inline text-right">
                <li><a className="cv-target">About</a></li>
                <li><a className="cv-target">Contact</a></li>
            </ul>
        </div>
    }
});


/**
 * *********************************************************
 * Create and configure a basic login panel
 * *********************************************************
 */
const CvReactLogin = React.createClass({

    mixins: [CvReactBase],

    render: function () {
        return <div>
            <div className="cv-login-wrapper">
                <div className="cv-login-logo"/>
                <CvLoginPanel
                    defaultGatewayUrl={'gw.catavolt.net'}
                    defaultTenantId={'catavolt-qa'}
                    defaultUserId={'qatester'}
                    showGatewayUrl={false}
                    showClientType={false}
                    loginListeners={[(event:CvEvent<CvLoginResult>)=>{
                            const windowId = event.resourceId;  //get the session (window) from the LoginEvent
                            this.context.router.replace('/workbench/' + windowId + '/' + '0');
                        }]}
                />
                <CvMessagePanel/>
            </div>
       </div>
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
        return <CvAppWindow windowId={windowId}>
                    <div className="cv-window">
                        <div className="cv-logo pull-left"/>
                        <CvMessagePanel/>
                        <div className="cv-top-nav text-right">
                            <CvLogout 
                                renderer={(cvContext:CvContext, callback:CvLogoutCallback)=>{
                                    return <a className="cv-target" onClick={callback.logout}>Logout</a>
                                }}
                                logoutListeners={[()=>{ this.context.router.replace('/');}]}
                            />
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
        const selectionAdapter:CvValueAdapter<Workbench> = new CvValueAdapter<Workbench>();  //the glue for our menu and workbench
        (selectionAdapter as CvValueProvider<Workbench>).subscribe((workbench:Workbench)=>{
            this.context.router.replace('/workbench/' + windowId + '/' + workbench.workbenchId);
        });
        let workbenchEl = null;
       
        /**
         ****************************************************************
         * Example 1 - Graphical Workbench with a 'Dropdown' Menu
         ****************************************************************
         */
        //*
            const menuRenderer = ()=>{
                return <div className="col-sm-3 col-sm-offset-9 text-right">
                    <CvDropdownWorkbenchMenu workbenchSelectionListener={selectionAdapter.createValueListener()} initialSelectedWorkbenchId={workbenchId}/>
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
        return(
            <div>
                {workbenchEl}
                <CvWaitPopup paramProvider={this.waitProvider}/>
            </div>
        );
                    
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


    componentWillMount: function () {
        console.log("mounting CvReactNavigator");
    },

    componentWillReceiveProps: function(nextProps) {
        console.log("receive props CvReactNavigator")
    },

    componentWillUpdate: function(nextProps, nextState, nextContext) {
        console.log("updating CvReactNavigator")
    },
    
    render: function () {

        const windowId = this.props.params.windowId; //get the window from the url param
        const currentNavId = this.props.params.navId;
        const router = this.context.router;
        return <div>
            <CvNavigator navigationId={currentNavId}
                navigationListeners={[(event:CvEvent<CvNavigationResult>)=>{
                    const nextNavigationId = event.resourceId;
                    if(nextNavigationId) {
                        if(event.eventObj.type === CvNavigationResultType.FORM) {
                            if(event.eventObj.noTransition) {
                                this.navPopupListener(nextNavigationId);    
                            } else {
                                const target = '/navigator/' + windowId + '/' + nextNavigationId;
                                event.eventObj.sourceIsDestroyed ? router.replace(target) : router.push(target);
                            }
                        } else if(event.eventObj.type === CvNavigationResultType.URL) {
                            window.open((event.eventObj.navRequest as WebRedirection).webURL, '_blank'); 
                        }
                    } else {
                        //force a refresh if there's no new resource (i.e. a NullNavigation)
                        router.replace('/navigator/' + windowId + '/' + currentNavId);
                    }
                }]}
                actionListeners={[this._showWaitState]}
                stateChangeListeners={[(event:CvEvent<CvStateChangeResult>)=>{
                    if(event.eventObj.type === CvStateChangeType.DESTROYED) {
                        router.goBack();
                    }
                }]}
            />
            <CvPopupNavigator paramProvider={this.navPopupProvider}/>
            <CvWaitPopup paramProvider={this.waitProvider}/>
        </div>
    },
});

/**
    Component that overlays a 'wait' spinner, shown between navigations
 */
const CvWaitPopup = React.createClass<{paramProvider:CvValueProvider<boolean>}, {visible:boolean}>({
    
    componentWillMount: function() {
       if(this.props.paramProvider) {
           this.props.paramProvider.subscribe(this._handleParamChange);
       } 
    },
    
    getDefaultProps: function () {
        return {paramProvider:null}
    },
    
    getInitialState: function() {
        return {visible: false};
    },

    render: function () {
        return (
            <div className="modal" role="dialog"
                 ref={(d:any)=>{
                        if(this.state.visible) {
                            var m:any = $(d);
                            if(m && m.modal){ m.modal({show:true, keyboard: false, backdrop: 'static'} ) }
                        } else {
                            var m:any = $(d);
                            if(m && m.modal){ m.modal('hide') }
                        }
                }}>
                <div className="modal-dialog">
                    <div className="modal-body">
                        <div className="cv-wait-screen text-center">
                            <i className="fa fa-spinner fa-pulse fa-5x"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    
    _handleParamChange: function(visible:boolean) {
        this.setState({visible: visible});
    },

});

const CvPopupNavigator = React.createClass<{paramProvider:CvValueProvider<string>}, {navigationId:string}>({
    
    componentWillMount: function() {
        if(this.props.paramProvider) {
            this.props.paramProvider.subscribe(this._handleParamChange);
        }
    },

    getDefaultProps: function () {
        return {paramProvider:null};
    },
    
    getInitialState: function() {
        return {navigationId: null}   
    },

    render: function () {
        return (
            <div className="modal" role="dialog"
                 ref={(d:any)=>{
                        if(this.state.navigationId) {
                            var m:any = $(d);
                            if(m && m.modal){ m.modal({show:true, keyboard: false, backdrop: 'static'} ) }
                        } else {
                            var m:any = $(d);
                            if(m && m.modal){ m.modal('hide') }
                        }
                }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-body">
                        <div className="cv-popup-nav-container">
                            {this.state.navigationId ?
                                <CvNavigator navigationId={this.state.navigationId}
                                             navigationListeners={[(event:CvEvent<CvNavigationResult>)=>{
                                                const nextNavigationId = event.resourceId;
                                                if(nextNavigationId) {
                                                    if(event.eventObj.type === CvNavigationResultType.FORM) {
                                                        this.setState({navigationId: nextNavigationId});
                                                    } else if(event.eventObj.type === CvNavigationResultType.URL) {
                                                        window.open((event.eventObj.navRequest as WebRedirection).webURL, '_blank'); 
                                                    }
                                                }
                                             }]}
                                             actionListeners={[]}
                                             stateChangeListeners={[(event:CvEvent<CvStateChangeResult>)=>{
                                                    //right now, any sort of state change closes the modal
                                                    //we could customize this more with delegate actions
                                                    this.setState({navigationId: null});
                                             }]}
                                />
                            : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    
    _handleParamChange: function(navigationId:string) {
        this.setState({navigationId: navigationId})
    }
});


/**
 * *********************************************************
 * Wire things together with 'routes'
 * *********************************************************
 */
ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={CvReactApp}>
            <IndexRoute component={CvReactLogin}/>
            <Route path="app" component={CvReactWindow}>
                <Route path="/workbench/:windowId/:workbenchId" component={CvReactWorkbench}/>
                <Route path="/navigator/:windowId/:navId" component={CvReactNavigator}/>
            </Route>
        </Route>
    </Router>
    , document.getElementById('cvApp')
);
