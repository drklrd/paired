import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';

class App extends React.Component {

    updateId(){

        this.state.peer.on('open',function(id){
            
            this.setState({
                id : id
            });

            var socket = io();

            socket.emit('newLogin',id);

            socket.on("currentonlineusers",function(onlineusers){
                console.log('current users',onlineusers)
            })
            
        }.bind(this))

    }

   

    constructor(props) {
        super(props);

        

        var peerObj = new Peer({ 
                key : 'o9c6k6w74ebl0udi',
                debug: 3,
                logFunction : function(){
                    // console.log(Array.prototype.slice.call(arguments).join(' '));
                }
        });

        this.state = {
                peer: peerObj,
        };
        
        this.updateId();

        

        

        

        

        peerObj.on('connection', function (conn) {
            console.log('COneection',conn.peer)
            if(conn.label === "chat"){

                conn.on('data', function (data) {
                    console.log('Received Message', data);
                });
         

            }else if (conn.label === "file"){

                 conn.on('data', function (data) {
                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            var blob = new Blob([data.file], {type: data.filetype});
                            var url = URL.createObjectURL(blob);
                            a.href = url;
                            a.download = name;
                            a.click();

                            console.log('Received url',url)
                });

            }

            
        });

        peerObj.on('data', this.onReceiveData);


        
    }


    // onReceiveData(data){
    //     // console.log('Received', data);

    //     var blob = new Blob([data.file], {type: data.filetype});
    //     var url = URL.createObjectURL(blob);

    //     // console.log('url',url)

    // }


    connectTo(peerid) {

        var connection = this.state.peer.connect(peerid.value,{
            label : 'chat'
        });
        var fileconnection = this.state.peer.connect(peerid.value,{
            label : 'file'
        });
        this.setState({
            connection: connection,
            fileconnection : fileconnection
        })

        connection.on('open', function () {
            connection.send("Hello")
        })

        // fileconnection.on('open')

    }


    connectWithPeer(e) {
        e.preventDefault();
        this.connectTo(this.refs['peerid']);
    }

    sendFile(event) {
        console.log(event.target.files);
        var file = event.target.files[0];
        var blob = new Blob(event.target.files, { type: file.type });

        this.state.fileconnection.send({
            file: blob,
            filename: file.name,
            filetype: file.type
        });

    }

    render() {

        if(this.state && this.state.id){
            var idInfo = this.state.id;
        }else{
            var idInfo = "";
        }

        return (
            <div>

                <span>
                    Your ID is : {idInfo}
                </span>

                <form onSubmit={this.connectWithPeer.bind(this)}>

                    <input ref="peerid" type="text" />
                    <input type="file" name="file" id="file" className="mui--hide" onChange={this.sendFile.bind(this)} />
                    <button type="submit"></button>

                </form>


            </div>

        )
    }

}

ReactDOM.render(<App />, document.getElementById('app'));