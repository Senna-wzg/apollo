import React from "react";
import { inject, observer } from "mobx-react";
import { Tab } from "react-tabs";

import SplitPane from 'react-split-pane';
import Header from "components/Header";
import MainView from "components/Layouts/MainView";
import ToolView from "components/Layouts/ToolView";
import MonitorPanel from "components/Layouts/MonitorPanel";
import SideBar from "components/SideBar";
import AudioCapture from "components/AudioCapture";

import HOTKEYS_CONFIG from "store/config/hotkeys.yml";
import WS, { MAP_WS, POINT_CLOUD_WS, CAMERA_WS } from "store/websocket";


@inject("store") @observer
export default class Dreamview extends React.Component {
    constructor(props) {
        super(props);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.updateDimension = this.props.store.updateDimension.bind(this.props.store);
    }

    handleDrag(masterViewWidth) {
        const { options } = this.props.store;
        if (options.showMonitor) {
            this.props.store.updateWidthInPercentage(
                Math.min(1.00, masterViewWidth / window.innerWidth));
        }
    }

    handleKeyPress(event) {
        const { options, enableHMIButtonsOnly, hmi } = this.props.store;

        const optionName = HOTKEYS_CONFIG[event.key];
        if (!optionName || options.showDataRecorder) {
            return;
        }

        event.preventDefault();
        if (optionName === "cameraAngle") {
            options.rotateCameraAngle();
        } else if (
            !options.isSideBarButtonDisabled(optionName, enableHMIButtonsOnly, hmi.inNavigationMode)
        ) {
            this.props.store.handleOptionToggle(optionName);
        }
    }

    componentWillMount() {
        this.props.store.updateDimension();
    }

    componentDidMount() {
        WS.initialize();
        MAP_WS.initialize();
        POINT_CLOUD_WS.initialize();
        CAMERA_WS.initialize();
        window.addEventListener("resize", this.updateDimension, false);
        window.addEventListener("keypress", this.handleKeyPress, false);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimension, false);
        window.removeEventListener("keypress", this.handleKeyPress, false);
    }

    render() {
        const { dimension, options, hmi } = this.props.store;

        return (
            <div>
                <Header />
                <div className="pane-container">
                    <SplitPane split="vertical"
                        size={dimension.width}
                        onChange={this.handleDrag}
                        allowResize={options.showMonitor}>
                        <div className="left-pane">
                            <SideBar />
                            <div className="dreamview-body">
                                <MainView />
                                <ToolView />
                            </div>
                        </div>
                        <MonitorPanel
                            hmi={hmi}
                            viewName={options.monitorName}
                            showVideo={options.showVideo} />
                    </SplitPane>
                </div>
                <div className="hidden">
                    {options.enableAudioCapture && <AudioCapture />}
                </div>
            </div>
        );
    }
}