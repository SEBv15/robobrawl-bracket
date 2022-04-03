import React from 'react';
import Modal from 'react-modal';

import ClipLoader from "react-spinners/ClipLoader";

import './botInfo.scss'

Modal.setAppElement('#root');


const customStyles = {
    overlay: {
        backgroundColor: "rgba(30,30,30,0.6)",
    },
    contentTransparent: {
        backgroundColor: "transparent",
        borderColor: "transparent",
    },
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      backgroundColor       : 'white',
      borderColor           : '#bbb'
    }
  };

export default class BotInfo extends React.Component {
    state = {
        loaded: false,
        invalidId: false,
    }
    loading = false
    loadData = async () => {
        this.loading = true
        if (!this.props.scrapyardId) {
            this.setState({loaded: true})
            return
        }
        var data = await fetch("http://robobrawl.illinois.edu/wp-json/scrapyard/v1/get-bot/"+this.props.scrapyardId)
        //var data = await fetch("http://localhost:3001/wp-json/scrapyard/v1/get-bot/"+this.props.scrapyardId)
        try {
            this.data = await data.json();
        } catch(err) {
            this.setState({invalidId: true, loaded: true})
            return
        }
        if (Array.isArray(this.data) && this.data.length == 0) {
            this.setState({invalidId: true, loaded: true})
            return
        }
        this.type = this.data.attributes.filter((attr) => attr.name.toLowerCase() == "type")
        this.type = this.type.length > 0?this.type[0].value:null
        this.setState({loaded: true})
    }
    render() {
        if (this.props.open && !this.loading && !this.loaded) {
            this.loadData();
        }
        return (
            <Modal
                isOpen={this.props.open}
                onRequestClose={this.props.close}
                style={{
                    overlay: customStyles.overlay,
                    content: this.state.loaded?customStyles.content:{...customStyles.content, ...customStyles.contentTransparent},
                }}
                contentLabel="Bot Info"
                >
                {this.state.loaded?(
                    <div className="botInfo">
                        <h2>
                            {this.props.name}
                        </h2>
                        {this.data.organization?<span className="org">{this.data.organization}</span>:""}
                        {this.props.scrapyardId && !this.state.invalidId?(
                            <>
                                {this.data.images.length > 0?<img className="picture" src={this.data.images[0].url} onLoad={this.onImgLoad} />:null}
                            </>
                        ):null}
                        <p>{this.data?.description}</p>
                        <div className="buttons">
                            {this.data?(
                                <a 
                                    target="_blank"
                                    className="openScrapyard"
                                    href={
                                        "http://robobrawl.illinois.edu/scrapyard-bot/?bot_id="
                                        +this.props.scrapyardId
                                    }
                                    >Open Scrapyard</a>
                            ):null}
                            <button className="close" onClick={this.props.close}>Close</button>
                        </div>
                    </div>
                ):(
                    <ClipLoader size={36} color={"white"} />
                )}
            </Modal>
        )
    }
}