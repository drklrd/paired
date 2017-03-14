import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';


const peerColors = [
    '#1abc9c',
    '#9b59b6',
    '#16a085',
    '#f1c40f',
    '#9b59b6',
    '#e74c3c',
    '#c0392b',
    '#f39c12',
    '#c0392b',
    '#d35400'
];

function getColor(){

    return peerColors[Math.floor(Math.random() * peerColors.length)];

}

class App extends React.Component {

    updateId() {

        this.state.peer.on('open', function(id) {



            var socket = io();

            swal({
                    title: "Enter p2p Pass Phrase",
                    text: "You need to enter a pass phrase for this",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    animation: "slide-from-top",
                    inputPlaceholder: "Pass phrase"
                },
                function(inputValue){
                    if (inputValue === false) return false;

                    if (inputValue === "") {
                        swal.showInputError("You need to provide a pass phrase");
                        return false
                    }

                    var room = inputValue;

                    swal.close();

                    socket.emit('newLogin', id, room , getColor() );

                    socket.on("currentonlineusers", function(onlineusers) {
                        // console.log('current users', onlineusers)
                        var conceredPeers = [];

                        onlineusers.forEach(function(user) {
                            if (user.split('_')[2] === room) {
                                conceredPeers.push(user);
                            }
                        })

                        this.setState({
                            id: id,
                            peers: conceredPeers
                        });

                    }.bind(this))

                }.bind(this));




        }.bind(this))

    }

    updateAlertState(peer){

        this.setState({
            alertMessage : true,
            messageText : peer + ' has sent you a file.'
        })

    }



    constructor(props) {
        super(props);

        var peerObj = new Peer({
            key : 'o9c6k6w74ebl0udi',
            debug: 3,
            logFunction: function() {
                // console.log(Array.prototype.slice.call(arguments).join(' '));
            }
        });

        this.state = {
            peer: peerObj,
            peers: []
        };

        this.updateId();

        var context = this;

        peerObj.on('connection', function(conn) {
             //console.log('COneection', conn.peer)
            // console.log('label', conn.label)
            if (conn.label === "chat") {

                conn.on('data', function(data) {
                    console.log('Received Message', data);
                });


            } else if (conn.label === "file") {

                conn.on("open",function(){

                    var transferOk = confirm(conn.peer + " wants to send you a file. Do you want to accept ?");

                    if(transferOk){
                        conn.on('data', function(data) {
                            console.log(data)

                            context.updateAlertState(conn.peer);

                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            var blob = new Blob([data.file], {
                                type: data.filetype
                            });
                            var url = URL.createObjectURL(blob);
                            a.href = url;
                            a.download = data.filename;
                            a.click();

                            console.log('Received url', url)
                        });
                    }else{
                        conn.close();
                    }


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

        var connection = this.state.peer.connect(peerid.value, {
            label: 'chat'
        });
        var fileconnection = this.state.peer.connect(peerid.value, {
            label: 'file'
        });
        this.setState({
            connection: connection,
            fileconnection: fileconnection
        })

        connection.on('open', function() {
            connection.send("Hello")
        })

        // fileconnection.on('open')

    }


    connectWithPeer(e) {
        e.preventDefault();
        this.connectTo(this.refs['peerid']);
    }

    sendFile(peerid, event) {

        console.log(event.target.files);
        var file = event.target.files[0];
        var blob = new Blob(event.target.files, {
            type: file.type
        });

        var fileconnection = this.state.peer.connect(peerid, {
            label: 'file'
        });

        fileconnection.on('open', function() {
            fileconnection.send({
                file: blob,
                filename: file.name,
                filetype: file.type
            });
        });



    }

    render() {



        if (this.state.id) {

            var peersInfo = this.state.peers.map(function(peer, id) {

                var peerColor = peer.split('_')[3] ;
                var IP = peer.split('_')[1];
                peer = peer.split('_')[0];

                var style = {
                    color : peerColor
                }

                var peerIcon = this.state.id === peer ?

                    < div style={style}>
                        < span className = "glyphicon glyphicon-user profile-user" > < /span>
                        < span > [You]   < /span>
                        < span > { peer  }   &nbsp;   @ { IP}  < /span>

                    < /div>

                :

                < div > < input type = "file" name = "file"   id = "file"    className = "inputfile"  onChange = { this.sendFile.bind(this, peer) } />
                    < label htmlFor = "file" style={style} >
                        < span className = "glyphicon glyphicon-user profile-user" > < /span>
                    < /label>
                    < span > { peer  }   &nbsp;   @ {       IP   } < /span>
                < /div>;

                return ( < div className = "eachpeer"
                    key = {
                        id
                    } >

                    {
                        peerIcon
                    }



                    < /div>
                )
            }.bind(this))

        } else {
            var peersInfo = < div   > Getting Peers... < /div>
        }

        if(this.state.alertMessage){
            var alertMessage = <div className="alert alert-success">
                <strong> {this.state.messageText} </strong>
            </div>
        }else{
            var alertMessage = "";
        }



        return ( < div >

            {alertMessage}

            <div className = "peersposition">


                {
                    peersInfo
                }

            </div>

            < /div>

        )
    }

}

ReactDOM.render( < App / > , document.getElementById('app'));

/*
 <form onSubmit={this.connectWithPeer.bind(this)}>

                    <input ref="peerid" type="text" />
                    <input type="file" name="file" id="file" className="mui--hide" onChange={this.sendFile.bind(this)} />
                    <button type="submit"></button>

                </form>*/