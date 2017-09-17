var Rx = require('rxjs/Rx');
var Observer = require('rxjs/Observer');
var ws = require('websocket');

var socket;
var count = 0;

let wsurl = 'ws://localhost:8080/'

var newCon, closeCon, trgClose;
var openObserver = {
  next: (msg) => {
    console.log(`%% openObserver msg: ${msg}`)
    if (msg == 'closed') {
      socket = Rx.Observable.webSocket(wsConf)
      socket.subscribe(
        (m) => {
          console.log(m)
        },
        (error) => {
          console.log('!!! connection failed !!!')
        },
        () => {
          if (closeCon) {
            console.log(`%%% openObserver closeCon unsub %%%`)
            closeCon.unsubscribe();
          }
          console.log('Socket complete'); }
      );
      newCon.unsubscribe();
    }
  },
  error: null,
  complete: () => {
    console.log('% openObserver complete!');
  }
};

var closeObserver = {
  next: (state) => {
    console.log(`@@ closeObserver msg: ${state}`)
    if (state === 'opened') {
      console.log(`@@ do socket unsubscribe.`)
      socket.unsubscribe();
    }
  },
  error: null,
  complete: () => {
    console.log('@ closed complete !') }
};

var connectionObserver;

/* var status = new Rx.Observable(
  (observer) => { connnectionObserver = observer})
  .publishBehavior(0).refCount(); */

var status = new Rx.Observable(
  (observer) => { connectionObserver = observer })
  .share();

const wsConf = {
  url: wsurl,
  WebSocketCtor: ws.w3cwebsocket,
  closeObserver: {
    next: (e) => {
      console.log('Closed!');
      connectionObserver.next('closed');
    }
  },
  openObserver: {
    next: (e) => {
      console.log('Connected.');
      connectionObserver.next('opened');
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
    socket = null;
    console.log('#### unsubscribe #####')
  }
}

function MyConnectWS () {
  if (!socket) {
    console.log('~~~ init socket ~~~ ')
    socket = Rx.Observable.webSocket(wsConf)
    socket.subscribe(
      (m) => {
        console.log(m)
      },
      (error) => {
        console.log('!!! connection failed !!!')
        console.log(socket)
      },
      () => {
        if (closeCon) {
          console.log('** init closeCon unsub **')
          closeCon.unsubscribe();
        }
        console.log('Socket complete');}
    )
  } else {
    console.log('In newCon way.')
    if (newCon) {
      console.log('newCon unsubscribe')
      newCon.unsubscribe();
    }
    newCon = status.subscribe(openObserver)
  }
}

function MyCloseWS() {
  console.log('In MyCloseWS way.')
  if (socket) {
    if (closeCon) {
      console.log('closeCon unsubscribe')
      closeCon.unsubscribe();
    }

    // trgClose = new Rx.Observable.timer(0, 1000).map((t) => {

    // });
    closeCon = status.subscribe(closeObserver);
    // trgClose.subscribe(
    //   (x) => {
    //     console.log(`--- trg: ${x}`)
    //     if (x) {
    //       connectionObserver.next('open');
    //     }
    //   },
    //   null,
    //   () => { console.log('---- trgClose complete')}
    // );
  }
}
status.subscribe(
  // (m) => { console.log(' >> status: ' + m)},
  // (error) => {console.log(error)},
  // () => {console.log(' status done')}
);

MyConnectWS();
MyCloseWS();
MyCloseWS();
MyCloseWS();
MyConnectWS();
MyCloseWS();


// setTimeout(() => { MyCloseWS(); }, 8000)
// setTimeout(() => { MyCloseWS(); }, 11000)
// setTimeout(() => { MyConnectWS(); }, 8000)

// setTimeout(() => { MyConnectWS(); }, 5000)
// closeWebSocket();
// connect();

// setTimeout(() => {
//   closeWebSocket();
// }, 5000);

// setTimeout(() => { MyConnectWS(); }, 7000)
// setTimeout(() => { MyConnectWS(); }, 9000)
// setTimeout(() => {
//   closeWebSocket();
// }, 11000);

// setTimeout(()=> { MyConnectWS(); }, 15000);

// connect()
