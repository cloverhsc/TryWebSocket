var Rx = require('rxjs/Rx');
let cob
let cs = new Rx.Observable(
  (observer) => { cob = observer}).share();
cs.subscribe(

)

var openObserver = {
  next: (msg) => {
    if (msg == 'closed') {
      socket = Rx.Observable.webSocket(wsConf)
      socket.subscribe(
        (m) => {
          console.log(m)
        },
        (error) => {
          console.log('!!! connection failed !!!')
          console.log(socket)
        }
      )
    }
  },
  error: null,
  complete: () => {
    console.log('% connect complete!');
    if (conSubscription) { conSubscription.unsubscribe() }
  }
};

var obsv = {
  next: (x) => { console.log(x)},
  error: (err) => {console.log(err)},
  complete: () => { console.log('Done')}
}
var status = new Rx.Observable((obs) => { obsv = obs})

status.subscribe(
  (x) => {console.log(x)},
  null,
  () => {console.log('done')}
);

obsv.next('clover');
obsv.complete();



