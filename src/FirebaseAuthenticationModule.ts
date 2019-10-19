import { Subject } from 'rxjs';
import * as firebase from 'firebase';


interface IFirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

class FirebaseAuthenticationModule {
    private firebase:any = null;
    private AuthStatus: any = new Subject();
    public AuthStatus$ = this.AuthStatus.asObservable();

    constructor(private firebaseConfig:IFirebaseConfig){
        this.firebase = firebase;
        this.Init();
    }

    Init = () => {
        this.firebase.initializeApp(this.firebaseConfig);
        this.firebase.auth().onAuthStateChanged((user) => {
            if(user){
                this.AuthStatus.next({authenticated: true, data: user});
            }else {
                this.AuthStatus.next({authenticated: false, data: null});
            }
        });
    }

    Logout = () => {
        if (this.firebase.auth().currentUser) {
            this.firebase.auth().signOut();
        }
    }

    Login = (email:string, password:string) => {
        this.firebase.auth().signInWithEmailAndPassword(email, password)
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                this.AuthStatus.next({ authenticated: false, data: { message: 'wrong password', error: error }});
            } else {
                this.AuthStatus.next({ authenticated: false, data: { message: errorMessage, error: error }});
            }
        });
    }

    Register = (email:string, password:string) => {
        this.firebase.auth().createUserWithEmailAndPassword(email, password).catch( (error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                this.AuthStatus.next({ authenticated: false, data: { message: 'password weak', error: error }});
            } else {
                this.AuthStatus.next({ authenticated: false, data: { message: errorMessage, error: error }});
            }
        });
    }
}

export { IFirebaseConfig, FirebaseAuthenticationModule }