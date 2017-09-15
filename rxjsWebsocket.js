var Rx = require('rxjs/Rx');
var Observer = require('rxjs/Observer');
var ws = require('websocket');

var socket;
var count = 0;

let wsurl = 'ws://localhost:8080/'


var openObserver = {
  next: (msg) => {
    console.log(`% openObserver msg: ${msg}`)
    if (msg == 'closed') {
      socket = Rx.Observable.webSocket(wsConf)
      socket.subscribe(
        (m) => {
          console.log(m)
        },
        (error) => {
          console.log('!!! connection failed !!!')
        },
        () => { console.log('Socket complete') }
      )
    }
  },
  error: null,
  complete: () => {
    console.log('% openObserver complete!');
  }
};

var closeObserver = {
  next: (msg) => {
    console.log(`@ closeObserver msg: ${msg}`)
    if (msg != 'closed') {
      socket.unsubscribe();
    }
  },
  error: null,
  complete: () => { console.log('@ closed complete !') }
};

var newCon, closeCon;
var connectionObserver;

var status = new Rx.Observable(
  (observer) => { connnectionObserver = observer}).share();

const wsConf = {
  url: wsurl,
  WebSocketCtor: ws.w3cwebsocket,
  closeObserver: {
    next: (e) => {
      console.log('Closed!');
      connnectionObserver.next('closed')
    }
  },
  openObserver: {
    next: (e) => {
      console.log('Connected.');
      connnectionObserver.next('opened')
    }
  }
}

function connect() {
  if (!socket) {
    socket = Rx.Observable.webSocket(wsConf)
    socket.subscribe(
      (m) => {
        console.log(m)
      },
      (error) => {
        // console.log(error);
        console.log('!!! connection failed !!!')
        console.log(socket)
        // if (!socket) {
        //   reconnection();
        // }
      },
      () => { console.log('socket complete')}
    )
  }
}

function reconnection() {
  console.log('%%% Now reconnect alert connection. %%%');
  closeWebSocket();
  reconnectObservable = Rx.Observable.interval(3000)
    .takeWhile((v, index) => {
      // 重連次數少於 reconnectAttempts 並且 建立websocket 失敗就繼續retry
      console.log(`%% index: ${index} %%`)
      return index < 5 && !socket
    });

  reconnectObservable.subscribe(
    (m) => {
      count++;
      console.log(`***** Retry ${this.count}.....${m}`)
      connect()
    },
    null,
    () => {
      reconnectObservable = null;
      console.log('****************')
      if (!this.socket) {
        console.log('緊急求助列表無法連線！')
      }
    }
  );
}

function closeWebSocket() {
  if (socket) {
    socket.unsubscribe();
    console.log('#### unsubscribe #####')
  }
  //   closeCon = connectStatus.takeWhile(
  //     (x) => {
  //       console.warn('@ ' + x)
  //       return x != 'closed'
  //     }).take(1);

  //   closeCon.subscribe(
  //     () => {
  //       socket.unsubscribe();
  //       console.log('#### unsubscribe #####')
  //     },
  //     null,
  //     () => {
  //       console.log('#### complete close ####')
  //     }
  //   );
  // }
}

function MyConnectWS () {
  if (!socket) {
    socket = Rx.Observable.webSocket(wsConf)
    socket.subscribe(
      (m) => {
        console.log(m)
      },
      (error) => {
        console.log('!!! connection failed !!!')
        console.log(socket)
      },
      () => { console.log('Socket complete')}
    )
  } else {
    console.log('In newCon way.')
    if (newCon) {
      console.log('newCon unsubscribe')
      newCon.unsubscribe();
    }
    newCon = status.take(1).subscribe(openObserver)
  }
}

status.subscribe(
  (m) => { console.log(' >> status: ' + m)},
  (error) => {console.log(error)},
  () => {console.log(' status done')}
);

MyConnectWS();
setTimeout(() => { MyConnectWS(); }, 5000)
setTimeout(() => { MyConnectWS(); }, 7000)
// closeWebSocket();
// connect();
setTimeout(() => {
  closeWebSocket(); }, 10000);

setTimeout(() => {
  closeWebSocket();
}, 13000);

setTimeout(()=> { MyConnectWS(); }, 15000);

// connect()
