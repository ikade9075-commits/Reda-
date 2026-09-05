import React, { useState, useRef, useEffect } from 'react';
import '../styles/VideoCall.css';

const VideoCall = ({ userId, otherUserId, onEndCall, socket }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_call', async (data) => {
      const { offer } = data;
      if (window.confirm(`استقبل مكالمة من ${data.from}`)) {
        await initiatePeerConnection(data.from);
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer_call', { to: data.from, answer });
      }
    });

    socket.on('call_answered', async (data) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('ice_candidate', (data) => {
      if (peerConnection.current && data.candidate) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('call_ended', () => {
      endCall();
    });
  }, [socket]);

  const initiatePeerConnection = async (recipientId) => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { to: recipientId, candidate: event.candidate });
      }
    };

    if (window.location.href.includes('caller')) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('initiate_call', { to: recipientId, offer });
    }

    setIsCallActive(true);
  };

  const initiateCall = async () => {
    await initiatePeerConnection(otherUserId);
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setIsCallActive(false);
    socket.emit('end_call', { to: otherUserId });
    onEndCall();
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-streams">
        <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
      </div>

      <div className="call-controls">
        {!isCallActive ? (
          <button className="btn-call" onClick={initiateCall}>📞 بدء مكالمة</button>
        ) : (
          <>
            <button className={`btn-control ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button className={`btn-control ${!isVideoOn ? 'active' : ''}`} onClick={toggleVideo}>
              {isVideoOn ? '📹' : '❌'}
            </button>
            <button className="btn-end-call" onClick={endCall}>📵 إنهاء المكالمة</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
