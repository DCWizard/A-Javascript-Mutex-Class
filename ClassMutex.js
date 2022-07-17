var TheCopyRightNotice      = `Copyright © 2020-2022 Denis Cote ThinknSpeak`;

class MutexObj {
  constructor(ThisName, ThisState) {
  this.name                 = ThisName;
  this.State                = ThisState;
  }
}
class Mutex {
  constructor() {
    // PRIVATE :
    var _LockState          = false;
    var _Locked             = false;
    var _InterA             = false;
    var _InterB             = false;
    var _InterC             = false;
    var _InterD             = false;
    var _InterE             = false;
    var _InterF             = false;
    var OneLock             = new MutexObj("Init", "Unlocked");
    var _DEBUG              = false;
    
    
    async function WaitForUnlockedState (ThisObj, Thisdelay, ThisCallBack){
      return new Promise(resolve => {
        let ThisInterval          = setInterval (function (){
          if((ThisObj.IsLocked() == false)
          ){
            clearInterval(ThisInterval);
            if(typeof ThisCallBack === 'function'){
              ThisCallBack(ThisObj);
            }
            resolve(ThisObj);
          }
        }, Thisdelay);
      });
    }
    async function _AcquireNextLock (ThisName) {
    
      if(_DEBUG){console.warn("Making a new Promise", ThisName, this.IsLocked());}
      return new Promise((resolve) => {
        WaitForUnlockedState          (this, this.LookupDelay, function (ThisObj){
          let ThisState             = ThisObj.Lock(ThisName);
          if(!(ThisState)){
            console.warn("Failed to get lock", ThisName, ThisState);
          } else {
            ThisObj.LockStack.push(ThisMutexObj);
          }
          resolve(ThisState); 
        });
      });
    }

    // PUBLIC:  
    this.LockStack          = [];
    this.LookupDelay        = 125;
    this.IsLocked           = function (){
      if((_LockState)
      || (_Locked)
      || (_InterA)
      || (_InterB)
      || (_InterC)
      || (_InterD)
      || (_InterE)
      || (_InterF)
      ){
        return true;
      }
      return false;
    }
    // HANDLING RACE CONDITION ONLY ONE MUST END UP WITH THE LOCK
    this.Lock               = function (ThisName){
      if(_LockState) {return false;}
      _LockState            = true;
      if(_Locked) {return false;}
      _Locked               = true;
      if(_InterA) {return false;}
      _InterA               = true;
      if(_InterB) {return false;}
      _InterB               = true;
      if(_InterC) {return false;}
      _InterC               = true;
      if(_InterD) {return false;}
      _InterD               = true;
      if(_InterE) {return false;}
      _InterE               = true;
      if(_InterF) {return false;}
      _InterF               = true;
      let ThisMutexObj      = new MutexObj(ThisName, "Locked");
      OneLock               = ThisMutexObj;
      return true;
    }
    this.Unlock             = function (){
      OneLock.State         = "Unlocked"; 
      _InterF               = false;
      _InterE               = false;
      _InterD               = false;
      _InterC               = false;
      _InterB               = false;
      _InterA               = false;
      _Locked               = false;
      _LockState            = false;
    }
    // THIS JUST A MUTEX
    // *** IMPORTANT *** DO NOT ASSUME THE ORDER OF THE SYNC IT'S THE FIRST ONE THAT GET THE UNLOCK STATUS
    // FOR INSTANCE A,B,C,D YOU COULD END UP A,D,B,C AND SO ON
    // IF IT IS YOUR INTEND YOU WILL NEED TO IMPLEMENT A SOLID PIPE STACK THAT WOULD MAKE SURE IT WAITS ON THE PREVIOUS OBJECT RELEASE.
    // IN THIS VERSION ALL REQUEST COMPETE TO GET THE LOCK 
    this.AcquireLock        = async function (ThisName) {
      return new Promise( async (resolve) => {
        let ThisLock        = false;
        while(!(ThisLock)){
          ThisLock          = await _AcquireNextLock.call(this, ThisName); 
        }
        if(_DEBUG){console.warn("Got Locked & Loaded", ThisLock);}
        resolve (ThisLock);
      });
    }
    this.Execute            = async function (ThisName, ThisCallBack) {
      if(_DEBUG){console.log(ThisName, " Requesting lock");}

      let ThisLock          = await this.AcquireLock(ThisName); 

      async function _Execute (){
        return new Promise(async (resolve) => {
          let ThisRet       = null;
          if(_DEBUG){console.log(ThisName, "Acquired lock");}
        
          if(typeof ThisCallBack === 'function'){
            if(_DEBUG){console.log(ThisName, "Executing this", ThisCallBack);}
            ThisRet         = await ThisCallBack.call(this, ThisName, ThisLock);
          }
          if(_DEBUG){console.log(ThisName, ThisRet, "Released lock");}
          this.Unlock(); 
          resolve(ThisRet);
        });
      }
      await _Execute.call (this);
    }
  }
}

// }
// /*
// EXAMPLE:
const WaitDelay = ThisDelay => new Promise(resolve => {
  setTimeout(resolve, ThisDelay);
});

const TheMutex              = new Mutex();
async function Executor (ThisName, ThisLock){
  console.log(ThisName + " Running...", ThisLock, this.IsLocked());
  for(let Each             in TheMutex.LockStack){
    let ThatLock            = TheMutex.LockStack[Each];
    console.log(ThatLock.name + " Status:", ThatLock, ThatLock.State, "Current State:", (this.IsLocked()?"Locked":"unlocked"));
  }
  await WaitDelay(10000);
  return ThisName + " Succeeded";
}

TheMutex.Execute("A", Executor);
TheMutex.Execute("B", Executor);
TheMutex.Execute("C", Executor);
TheMutex.Execute("D", Executor);

// */

