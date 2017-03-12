import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';

class App extends React.Component {

    updateId() {

        this.state.peer.on('open', function(id) {



            var socket = io();

            var room = prompt('Enter p2p Pass Phrase')

            socket.emit('newLogin', id, room);

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

        }.bind(this))

    }



    constructor(props) {
        super(props);



        var peerObj = new Peer({
            key: 'o9c6k6w74ebl0udi',
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



        peerObj.on('connection', function(conn) {
            console.log('COneection', conn.peer)
            console.log('label', conn.label)
            if (conn.label === "chat") {

                conn.on('data', function(data) {
                    console.log('Received Message', data);
                });


            } else if (conn.label === "file") {

                conn.on('data', function(data) {
                    console.log(data)
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

                var IP = peer.split('_')[1];
                peer = peer.split('_')[0];


                var peerIcon = this.state.id === peer ?

                    < span className = "profile-user" >
                    < span className = "glyphicon glyphicon-user" > < /span> < br / >
                    < span > You < /span>   < /span> 

                :

                < div > < input type = "file"
                name = "file"
                id = "file"
                className = "inputfile"
                onChange = {
                    this.sendFile.bind(this, peer)
                }
                />  < label htmlFor = "file"
                className = "profile" >
                    < span className = "glyphicon glyphicon-user" > < /span> < /label>  < span > {
                        peer
                    }
                @ {
                    IP
                } < /span>  < /div>;

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
            var peersInfo = < span > Getting Peers... < /span>
        }



        return ( < div className = "peersposition" >


            {
                peersInfo
            }



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