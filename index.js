const express = require('express')
const router = express.Router();
const app = express()
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


// app.post('/', (req, res)=>{

//     const {sessionId, serviceCode, phoneNumber, text} = req.body
    
//     let response = ""
//     if (text == '') {
//         response += "CON 1. Deposit/Withdraw Cash \n"
//         response += "2. Salary Advance \n"
//         response += "3. Football \n"
//         response += "4. Back "
//     } else if (text == '1') {
//         response += "CON 1. Cash Deposit \n"
//         response += "2. Cash Withdrawal"
//     } else if (text == '11') {
//         response += "CON Please enter the amount you wish to deposit \n"
//     } else if (text == '12') {
//        const balance = "KES 10,000"
//         response = "END Your balance is " + balance
//     } else if (text == '2') {
//         response = "END This is your phone number " + phoneNumber
//     }


//     res.send(response)


  
// })

let depo = []
let withd = []
let token = '101'

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

menu.state('popup', {
    run: () => {
        menu.con('sdslsmdsnsd')
        
    }, 
    next: {
    
    }
})
 
menu.state('deposit/withdraw', {
    run: () => {
        menu.con(
            '1. Cash Deposit' +
            '\n2. Cash Withdrawal'
        )
        
    },

    next: {
        '1': "deposit",
        '2': 'withdraw'
    }
});

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
        menu.con(`You are about to deposit NGN${depo[0]} into the account of SANNI OLUWASEUN ${depo[1]}` +
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
        menu.end(`Your request has been logged. Visit the nearest GTBank branch to complete your deposit. Dial *333# to check your balance.`)
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
            menu.end('Invalid token')
        }

        if(menu.val == token) {
            menu.end(`Your request has been logged. Visit the nearest GTBank branch to complete your deposit. Dial *333# to check your balance.`)
        }      

    }
})

// nesting states
menu.state('buyAirtime.amount', {
    run: () => {
        // use menu.val to access user input value
        var amount = Number(menu.val);
        buyAirtime(menu.args.phoneNumber, amount).then(function(res){
            menu.end('Airtime bought successfully.');
        });
    }
});
 
// Registering USSD handler with Express
 
app.post('/', function(req, res){
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
});

app.listen(PORT, () => console.log(`server port is ${PORT}` ));
