const express = require('express')
const router = express.Router();
const app = express()
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))



// Holds deposit inputs
let depo = []

//Holds withdraw inputs
let withd = []

//Withdraw token
let token = '0000'

// Define menu states
menu.startState({
    run: () => {
        depo = []
        withd = []
        // use menu.con() to send response without terminating session      
        menu.con(
            '1. Deposit/Withdraw Cash' +
            '\n2. Salary Advance' + 
            '\n3. Football' + 
            '\n4. Back');
    },
    // next object links to next state based on user input
    next: {
        '1': 'deposit/withdraw',
        '2': 'buyAirtime'
    }
});


menu.state('deposit/withdraw', {
    run: () => {
        const start = 8
        const end = 18
        let currentTime = new Date()

        // if (currentTime.getHours() >= start && currentTime.getHours() < end) {
            menu.con(
                '1. Cash Deposit' +
                '\n2. Cash Withdrawal'
            )
        // } 
        
        // if (currentTime.getHours() < start || currentTime.getHours() > end){
        //     menu.end('This service is available only between 08.00am - 05.00pm')
        // }

       
        
    }, 
    next: {
        '1': "deposit",
        '2': 'withdraw'
    }
})
 


menu.state('deposit', {
    run: () => {
        menu.con('Please enter the amount you wish to deposit')
    },
    next: {
        '*\\d+': 'deposit.amt'
    }
})

menu.state('deposit.amt', {
    run: () => {
        depo.push(Number(menu.val))
        menu.con('Please enter the NUBAN you want to deposit into')
    },
    next: {
        '*\\d+': 'accountno'
    }
})
 
menu.state('accountno', {
    run: () => {
        depo.push(Number(menu.val))
        menu.con(`You are about to deposit NGN${depo[0]} into the account of SANNI OLUWASEUN` +
        '\n1. Continue' + 
        '\n2. Cancel' );
    },
    next: {
        
        '1': 'deposit.confirm',
        '2': "cancel"
    }
});
 
menu.state('deposit.confirm', {
    run: () => {
        menu.end(`Your request has been logged. Visit the nearest First Bank branch to complete your deposit. Dial *333# to check your balance. Your deposit token is ******`)
    }
})

menu.state('cancel', {
    run: () => {
        menu.end(`Your request has been cancelled`)
    }
})

menu.state('withdraw', {
    run: () => {
        menu.con('Please enter the amount you want to withdraw')
    },
    next: {
        '*\\d+': 'withdraw.amt'
    }
})

menu.state('withdraw.amt', {
    run: () => {
        withd.push(Number(menu.val))
        menu.con(`Please enter PIN or Token code to confirm your withdrawal of NGN${withd[0]} or enter 0 to cancel`)
    },
    next: {
        '0': 'cancel',
        '*\\d+': 'withdraw.code'
    }
})

menu.state('withdraw.code', {
    run: () => {
        //Verify Token here
        if(menu.val != token) {
            menu.end('Invalid Token/PIN')
        }

        if(menu.val == token) {
            menu.end(`Your request has been logged. Visit the nearest First Bank branch to complete your withdrawal. Dial *333# to check your balance. Your withdraw token is ******`)
        }      

    }
})

 
// Registering USSD handler with Express
 
app.post('/', function(req, res){
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
});

app.listen(PORT, () => console.log(`server port is ${PORT}` ));
