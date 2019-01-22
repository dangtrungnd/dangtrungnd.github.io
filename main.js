//client
const socket = io('');

$('#infoCall').hide();

let customConfig;

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "overheo",
    secret: "7e5c7206-1de0-11e9-abd2-0242ac110003",
    domain: "dangtrungnd.github.io",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});

socket.on('list_user_online', arrUserInfo =>{
	$('#infoCall').show();
	$('#signUp').hide();
	arrUserInfo.forEach(user => {
		const {name, peerId} = user;
		$('#onUser').append(`<li id ="${peerId}">${name}</li>`);
	});
});

socket.on('has_new_user_online', user =>{
	const {name, peerId} = user;
	$('#onUser').append(`<li id ="${peerId}">${name}</li>`);
});

socket.on('has_user_out', peerId =>{
	$(`#${peerId}`).remove();
})

socket.on('register_faild', () =>  alert('Name is exist, please choose new name!'));

function openStream() {
	const config = { audio:false, video:true };
	return navigator.mediaDevices.getUserMedia(config);
}
function playStream(idVideoTag, stream) {
	const video = document.getElementById(idVideoTag);
	video.srcObject = stream;
	video.play();
}


//peer

const	peer = new Peer({
			key: 'peerjs',
			host: "my-peer3306.herokuapp.com",
			port: 443,
			secure: true,
		    config: customConfig
		});

//get peer id
peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
	    const userName = $('#txtUserName').val();
	    socket.emit('user_register', { name: userName, peerId: id });
	});
});

//call
$('#btnCall').click(() =>{
	const id = $('#remoteId').val();
	openStream()
	.then( stream =>{
		playStream('localStream', stream);
		const call = peer.call(id, stream);
		call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
	});
});

peer.on('call' , call =>{
	openStream()
	.then(stream => {
		call.answer(stream);
		playStream('localStream', stream);
		call.on('stream', remoteStream  => playStream('remoteStream', remoteStream));
	});
});

$('#onUser').on('click', 'li', function(){
	const id = $(this).attr('id');
	openStream()
	.then( stream =>{
		playStream('localStream', stream);
		const call = peer.call(id, stream);
		call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
	});
});
