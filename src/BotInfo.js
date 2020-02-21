import React from 'react';
import Modal from 'react-modal';

import './botInfo.scss'

Modal.setAppElement('#root');


const customStyles = {
    overlay: {
        backgroundColor: "rgba(30,30,30,0.6)",
    },
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

export default class BotInfo extends React.Component {
    getId = () => {
        var f = this.props.bots.filter((b)=>b.name==this.props.name)
        if (f[0]) {
            return f[0].id?f[0].id:null
        }
        return null
    }
    render() {
        return (
            <Modal
                isOpen={this.props.open}
                onRequestClose={this.props.close}
                style={customStyles}
                contentLabel="Example Modal"
                >
            
                <div className="botInfo">
                    <h2>{this.props.name}</h2>
                    {this.getId()?(
                    <a 
                        target="_blank"
                        href={
                            "http://robobrawl.illinois.edu/scrapyard-bot/?bot_id="
                            +this.getId()
                        }
                        >Open scrapyard page</a>
                    ):null}
                    <button onClick={this.props.close}>Close</button>
                </div>
            </Modal>
        )
    }
}