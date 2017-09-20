var Rx = require('rxjs/Rx');
var Observer = require('rxjs/Observer');
var ws = require('websocket');

var socket;


let wsurl = 'ws://192.168.33.179/emergency/7/'

var newCon, closeCon, closeCon1, trgClose;

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
          console.log(`%%%% closeCon: ${closeCon}`)
          if (closeCon) {
            console.log(`%%%% closeCon unsubscribe`)
            closeCon.unsubscribe()
            closeCon = null;
          }
          console.log('Socket complete...'); }
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

var closeObserver1 = {
  next: (state) => {
    console.log(`## closeObser1 msg: ${state}`)

  }
}

var connectionObserver = {
  next: (m) => m,
  error: (err) => {console.log(err)},
  complete: null
};

var status = new Rx.Observable(
  (observer) => { connectionObserver = observer})
  .publishBehavior(0).refCount();

  /* status.subscribe(
    (m) => {
      console.log('    status: ' + m)
    },
    (error) => {
      console.log(error)
    },
    () => {
      console.log('    status done')
    }
  ); */

/* var status = new Rx.Observable(
  (observer) => { connectionObserver = observer })
  .share(); */


const wsConf = {
  url: wsurl,
  WebSocketCtor: ws.w3cwebsocket,
  closeObserver: {
    next: (e) => {
      console.log(' >> Closed!');
      connectionObserver.next('closed');
    }
  },
  openObserver: {
    next: (e) => {
      console.log(' >> Connected.');
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
        // after websocket closed
        console.log(`!!! ### closeCon: ${closeCon}`)
        if (closeCon) {
          console.log(`!!! ### closeCon unsubscribe`)
          closeCon.unsubscribe()
          closeCon = null;
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
    if (!closeCon) {
      console.log(' empty closeCon do assign closeCon')
      closeCon = status.subscribe(closeObserver)
    } else {

      if (!trgClose) {
        console.log('Empty trgClose')
        trgClose = new Rx.Observable.timer(0, 1000).map(
          () => closeCon
        ).takeWhile(() => {
          return closeCon? true:false;
        });
        trgClose.subscribe(
          (x) => {
            console.log(`________ 1's ${x}`)
          },
          (err) => {console.log(err)},
          () => {
            console.log('    trgClose complete! ')
            console.log('    now trigger closeCon')
            closeCon = status.subscribe(closeObserver)
          }
        );
      } else {
        // 取消前一個trgClose
        if (trgClose) {
          console.log('unsubscribe before trgClose')
          trgClose.unsubscribe()
        }
        trgClose = new Rx.Observable.timer(0, 1000).map(
          () => closeCon
        ).takeWhile(() => {
          return closeCon ? true : false;
        });

        trgClose.subscribe(
          (x) => {
            console.log(`________ 2's ${x}`)
          },
          (err) => {
            console.log(err)
          },
          () => {
            console.log('    trgClose complete! ')
            console.log('    now trigger closeCon')
            closeCon = status.subscribe(closeObserver)
          }
        );
      }
    }
  }
}



// MyCloseWS();

MyConnectWS();
// MyCloseWS();

// MyConnectWS();
// MyCloseWS();
// MyConnectWS();


// MyConnectWS();


/* setTimeout(() => {
  console.log('-----------------');
  closeCon.unsubscribe();
}, 5000) */
// setTimeout(() => { MyCloseWS(); }, 4000)
// setTimeout(() => {
//   MyCloseWS();
// }, 7000)

// setTimeout(() => { MyConnectWS(); }, 3000)

// setTimeout(() => { MyConnectWS(); }, 7000)
// setTimeout(() => {
//   MyConnectWS();
// }, 8000)


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
