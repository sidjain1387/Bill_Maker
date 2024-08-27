import express from "express";
import ejs from "ejs";
import pg from "pg";
import bodyParser from "body-parser";

const app= express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());



const db=new pg.Client({
    user: "postgres",
    password:"Tiku2004###",
    host:"localhost",
    port:5432,
    database:"Bill",
  });

db.connect();

async function customers(){
    const result=await db.query("SELECT customer_id,customer_name FROM customer_info order by customer_name;");
    return result.rows;
}

async function date_now() {
    let now = new Date();
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let year = now.getFullYear();
    let formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

//CUSTOMER LIST
app.get("/customer_list",async(req,res)=>{
    try{
        let customers=await db.query("SELECT * FROM customer_info order by customer_id desc");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");

        res.render("customer/customer_list.ejs",{customer:customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_list");
        res.redirect("/");
    }
})
//END OF CUSTOMER LIST


//CUSTOMER ADD
app.get("/customer_add",(req,res)=>{
    try{
        res.render("customer/customer_add.ejs");
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_add");
        res.redirect("/customer_list");
    }
});
app.post("/customer_added",async(req,res)=>{
    try{
        const name=req.body.customer_name;
        const address=req.body.customer_address;
        const gstin=req.body.customer_gstin;
        const state=req.body.customer_state;
        const code=req.body.customer_code;

        const result=await db.query("INSERT INTO customer_info(customer_name,customer_address,customer_state,customer_state_code,customer_gstin) values ($1,$2,$3,$4,$5) RETURNING *;",[name,address,state,code,gstin]);
        res.redirect("/customer_list");
    }
    catch (err){
        let error=true;
        res.redirect("/customer_list");
        console.log(err);
        console.log("Error in post customer_added");
    }
})
//END OF CUSTOMER ADD


//CUSTOMER SORT
app.get("/customer_list_name_a-z",async(req,res)=>{
    try{
        let customers=await db.query("SELECT * FROM customer_info order by customer_name asc");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");

        res.render("customer/customer_list.ejs",{customer:customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_list_names_a-z");
        res.redirect("/customer_list");

    }
})
app.get("/customer_list_name_z-a",async(req,res)=>{
    try{
        let customers=await db.query("SELECT * FROM customer_info order by customer_name desc");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");

        res.render("customer/customer_list.ejs",{customer:customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_list_names_a-z");
        res.redirect("/customer_list");

    }
})
app.get("/customer_list_state_a-z",async(req,res)=>{
    try{
        let customers=await db.query("SELECT * FROM customer_info order by customer_state asc");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");

        res.render("customer/customer_list.ejs",{customer:customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_list_names_a-z");
        res.redirect("/customer_list");

    }
})
app.get("/customer_list_state_z-a",async(req,res)=>{
    try{
        let customers=await db.query("SELECT * FROM customer_info order by customer_state desc");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");

        res.render("customer/customer_list.ejs",{customer:customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get customer_list_names_a-z");
        res.redirect("/customer_list");

    }
})
//END OF CUSTOMER SORT



//EDIT CUSTOMER
app.post("/edit_selected_customer",async(req,res)=>{
    try{

        let selected_to_edit_customer_id=req.body.customer_id;
        let customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[selected_to_edit_customer_id]);
        res.render("customer/customer_edit.ejs",{customer:customer.rows[0]});
    }
    catch(err){
        console.log(err);
        console.log("Error in post edit_selected_customer");
        res.redirect("/customer_list");

    }
})
app.post("/final_edit_selected_customer",async(req,res)=>{
    try{

        const name=req.body.customer_name;
        const address=req.body.customer_address;
        const gstin=req.body.customer_gstin;
        const state=req.body.customer_state;
        const code=req.body.customer_code;
        let selected_to_edit_customer_id=req.body.customer_id;
        let result=await db.query("UPDATE customer_info SET customer_name=$1,customer_address=$2,customer_state=$3,customer_state_code=$4,customer_gstin=$5 WHERE customer_id=$6;",[name,address,state,code,gstin,selected_to_edit_customer_id]);
        res.redirect("/customer_list");
    }
    catch(err){
        console.log(err);
        console.log("Error in post final_edit_selected_customer");
        res.redirect("/customer_list");
    }
})
//END OF EDIT CUSTOMER


//DELETE CUSTOMER
app.post("/customer_delete",async(req,res)=>{
    try{
        let delete_status=true;
        let selected_customers = [];
        let original_selected_customers=req.body.customers_to_be_deleted;
        if(typeof(original_selected_customers)=='string'){
            let ticket=parseInt(original_selected_customers);
            selected_customers.push(ticket);
        }
        else{
            for(let j=0;j<original_selected_customers.length;j++){     
                let ticket=parseInt(original_selected_customers[j]);                    
                selected_customers.push(ticket);
            };
        }
        selected_customers.forEach(async(customer_id)=>{
            await db.query("DELETE FROM customer_info WHERE customer_id=$1;",[parseInt(customer_id)]);
        });
        res.redirect("/customer_list");
    }
    catch(err){
        res.redirect("/customer_list");
        console.log(err);
        console.log("Error in post customer_deleted");
    }
})
//END OF DELETE CUSTOMER


///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////


//AIR TICKET LIST
app.get("/air_ticket_list",async(req,res)=>{
    try{

        let air_ticket=await db.query("SELECT * FROM air_ticket order by air_ticket_id desc;");
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
        let customers_state=await db.query("SELECT customer_state FROM customer_info GROUP BY customer_state;");
        res.render("air_ticket/air_ticket_list.ejs",{air_ticket:air_ticket.rows,customers:all_customers.rows,customer_state:customers_state.rows});
    }
    catch(err){
        console.log(err);
        console.log("Error in get air_Ticket_list");
        res.redirect("/");
    }

})
//END OF AIR TICKET LIST


//AIR TICKET ADD
app.get("/air_ticket_add",async (req,res)=>{
    const customer= await customers();
    let previous_tickets=await db.query("SELECT * FROM air_ticket ORDER BY air_ticket_id DESC LIMIT 3;");
    res.render("air_ticket/air_ticket_add.ejs",{customer:customer,previous_tickets:previous_tickets.rows});
});
app.post("/air_ticket_added",async (req,res)=>{
    try{
    const flight_number=req.body.flight_number;
    const flight_date=req.body.flight_date;
    const flight_time=req.body.flight_time;
    const flight_pnr=req.body.flight_pnr;
    const flight_travel_location=req.body.flight_travel_location;
    const air_ticket_customer_name=req.body.air_ticket_customer_name;
    const air_ticket_biller_id=req.body.air_ticket_biller_id;
    const flight_quantity=req.body.flight_quantity;
    const flight_rate=req.body.flight_rate;
    const flight_sac_code=req.body.flight_sac_code;

    await db.query("INSERT INTO air_ticket(flight_number,flight_date,flight_time,flight_pnr,flight_travel_location,air_ticket_customer_name,air_ticket_biller_id,flight_quantity,flight_rate,flight_sac_code) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[flight_number,flight_date,flight_time,flight_pnr,flight_travel_location,air_ticket_customer_name,air_ticket_biller_id,flight_quantity,flight_rate,flight_sac_code]);
    res.redirect("/air_ticket_list");
    }
    catch (err){
        console.log(err);
        console.log("Error in post air_ticket_add");
        res.redirect("/air_ticket_list");
    }
})
//END OF AIR TICKET ADD


//AIR TICKET EDIT
app.post("/edit_selected_air_ticket",async(req,res)=>{
    try{

        let selected_to_edit_air_ticket=req.body.air_ticket_id;
        let customer=await customers();
        let air_tickets=await db.query("SELECT * FROM air_ticket WHERE air_ticket_id=$1",[parseInt(selected_to_edit_air_ticket)]);
        res.render("air_ticket/air_ticket_edit.ejs",{ticket:air_tickets.rows[0],customer:customer});
    }
    catch(err){
        console.log(err);
        console.log("Error in post edit_selected_air_ticket");
        res.redirect("/air_ticket_list");
    }
})
app.post("/final_edit_air_ticket",async(req,res)=>{
    try{
        let selected_to_edit_air_ticket=req.body.air_ticket_id;
        const flight_number=req.body.flight_number;
        const flight_date=req.body.flight_date;
        const flight_time=req.body.flight_time;
        const flight_pnr=req.body.flight_pnr;
        const flight_travel_location=req.body.flight_travel_location;
        const air_ticket_customer_name=req.body.air_ticket_customer_name;
        const air_ticket_biller_id=req.body.air_ticket_biller_id;
        const flight_quantity=req.body.flight_quantity;
        const flight_rate=req.body.flight_rate;
        const flight_sac_code=req.body.flight_sac_code;
        
        let result=await db.query("UPDATE air_ticket SET flight_number=$1,flight_date=$2,flight_time=$3,flight_pnr=$4,flight_travel_location=$5,air_ticket_customer_name=$6,air_ticket_biller_id=$7,flight_quantity=$8,flight_rate=$9,flight_sac_code=$10 WHERE air_ticket_id=$11;",[flight_number,flight_date,flight_time,flight_pnr,flight_travel_location,air_ticket_customer_name,air_ticket_biller_id,flight_quantity,flight_rate,flight_sac_code,selected_to_edit_air_ticket]);
        res.redirect("/air_ticket_list");
    }
    catch(err){
        console.log(err);
        console.log("Error in post final_edit_air_ticket");
        res.redirect("/air_ticket_list");
    }

})  
//END OF AIR TICKET EDIT


//DELETE AIR TICKET
app.post("/air_ticket_delete",async(req,res)=>{
    try{
        let air_ticket_id=req.body.air_ticket_id;
        await db.query("DELETE FROM air_ticket WHERE air_ticket_id=$1;",[parseInt(air_ticket_id)]);
        res.redirect("/air_ticket_list");
    }
    catch(err){
        res.redirect("/air_ticket_list");
        console.log(err);
        console.log("Error in post delete_selected_air_ticket");
    }
})
//END OF DELETE AIR TICKET



app.get("/customer",(req,res)=>{
    res.render("customer.ejs");
});
 
app.get("/hotel_booking", async(req,res)=>{
    const customer= await customers();
    let previous_bookings=await db.query("SELECT * FROM hotel_booking ORDER BY hotel_booking_id DESC LIMIT 3;");
    res.render("hotel_booking.ejs",{customer:customer,previous_bookings:previous_bookings.rows});
});

app.get("/preprebill",async(req,res)=>{
    const customer= await customers();
    res.render("preprebill.ejs",{customer:customer});
});

app.get("/selected_bill_list",async(req,res)=>{
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
    let bill_status=2;
    let bill_id=req.body.bill_id;
    try{
        let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
        res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status,bill:bill.rows});
    }
    catch(err){
        console.log(err);
    }  
})



app.get("/delete_customer",async(req,res)=>{
    let customers=await db.query("SELECT * FROM customer_info order by customer_id desc");
    let delete_cus=0;
    res.render("delete_customer.ejs",{customer:customers.rows,delete_cus:delete_cus});
})

app.get("/delete_air_ticket",async(req,res)=>{
    let air_tickets=await db.query("SELECT * FROM air_ticket order by air_ticket_id desc;");
    let delete_air=0;
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("delete_air_ticket.ejs",{air_ticket:air_tickets.rows,delete_air:delete_air,customers:all_customers.rows});
})



app.get("/hotel_booking_list",async(req,res)=>{
    let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
    res.render("hotel_booking_list.ejs",{hotel_booking:hotel_booking.rows,customers:all_customers.rows});
})

app.get("/delete_hotel_booking",async(req,res)=>{
    let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc");
    let delete_hotel=0;
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("delete_hotel_booking.ejs",{hotel_booking:hotel_booking.rows,delete_hotel:delete_hotel,customers:all_customers.rows});
})

app.get("/delete_bill",async(req,res)=>{
    let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
    const customer= await customers();
    let delete_bill=0;
    res.render("delete_bill.ejs",{bill:bill.rows,customers:customer,delete_bill:delete_bill});
})

app.get("/edit_bill",async(req,res)=>{
    let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
    const customer= await customers();
    res.render("edit_1_bill.ejs",{bill:bill.rows,customers:customer});
})



let currentbillno=0;
let currentbillerid=0;
let currentbillername="";
let choice=0;



app.post("/addhotelbooking",async (req,res)=>{
    const hotel_booking_customer_name=req.body.hotel_booking_customer_name;
    const hotel_name=req.body.hotel_name;
    const hotel_location=req.body.hotel_location;
    const hotel_nights=req.body.hotel_nights;
    const hotel_check_in_date=req.body.hotel_check_in_date;
    const hotel_check_out_date=req.body.hotel_check_out_date;
    const hotel_booking_biller_id=req.body.hotel_booking_biller_id;
    const hotel_quantity=req.body.hotel_quantity;
    const hotel_rate=req.body.hotel_rate;
    const hotel_sac_code=req.body.hotel_sac_code;
    const customer= await customers();


    try{
        const result=await db.query("INSERT INTO hotel_booking(hotel_booking_customer_name,hotel_name,hotel_location,hotel_nights,hotel_check_in_date,hotel_check_out_date,hotel_booking_biller_id,hotel_quantity,hotel_rate,hotel_sac_code) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[hotel_booking_customer_name,hotel_name,hotel_location,hotel_nights,hotel_check_in_date,hotel_check_out_date,hotel_booking_biller_id,hotel_quantity,hotel_rate,hotel_sac_code]);
        let previous_bookings=await db.query("SELECT * FROM hotel_booking ORDER BY hotel_booking_id DESC LIMIT 3;");

        res.render("hotel_booking.ejs",
            {name:result.rows[0].hotel_booking_customer_name ,
                 hotel_name:result.rows[0].hotel_name ,
                 hotel_location:result.rows[0].hotel_location ,
                 hotel_nights:result.rows[0].hotel_nights,
                 hotel_check_in_date:result.rows[0].hotel_check_in_date,
                 hotel_check_out_date:result.rows[0].hotel_check_out_date,
                 customer:customer,
                quantity:result.rows[0].hotel_quantity,
                rate:result.rows[0].hotel_rate,
                sac_code:result.rows[0].hotel_sac_code,
                previous_bookings:previous_bookings.rows});
    }
    catch (err){
        console.log(err);
    }
})

app.post("/prebill",async(req,res)=>{
    currentbillno=req.body.bill_id;
    currentbillerid=req.body.customer_id;
    choice=req.body.choice;

    let bill_date = req.body.bill_date;

    let result2=await db.query("Insert into bill_info(bill_id,bill_customer_id,bill_date,bill_booking_type) values($1,$2,$3,$4)",[currentbillno,currentbillerid,bill_date,choice]);
    currentbillername=await db.query("SELECT customer_name FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    if(choice==1){
        let current_air_tickets=await db.query("SELECT * FROM air_ticket WHERE air_ticket_biller_id=$1 AND air_ticket_bill_id IS NULL",[currentbillerid]);
        res.render("prebill_air_ticket.ejs",{bill_id:currentbillno, customer_name:currentbillername.rows[0].customer_name, air_ticket:current_air_tickets.rows});
        
    }
    else if(choice==2){
        let current_hotel_booking=await db.query("SELECT * FROM hotel_booking WHERE hotel_booking_biller_id=$1 AND hotel_booking_bill_id IS NULL",[currentbillerid]);
        res.render("prebill_hotel.ejs",{bill_id:currentbillno, customer_name:currentbillername.rows[0].customer_name, hotel_booking:current_hotel_booking.rows});
    }
    else if(choice==3){
        let current_package=await db.query("SELECT * FROM package_info WHERE package_biller_id=$1 AND package_bill_id IS NULL",[currentbillerid]);
        res.render("prebill_package.ejs",{bill_id:currentbillno, customer_name:currentbillername.rows[0].customer_name, package_info:current_package.rows});
    
    }
})

app.post("/bill_hotel",async (req,res)=>{
    let selected_hotel_bookings = [];
    let service_charge_quantity = req.body.service_charge_quantity;
    let service_charge_rate = req.body.service_charge_rate;
    let sac_code = parseInt(req.body.sac_code_original);

    let service_charge = parseInt(service_charge_quantity) * parseInt(service_charge_rate);
    let original_selected_bookings=req.body.selected_bookings;
    let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_sac_code = $1 WHERE bill_id = $2;",[parseInt(sac_code),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_quantity = $1 WHERE bill_id = $2;",[parseInt(service_charge_quantity),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_rate = $1 WHERE bill_id = $2;",[parseInt(service_charge_rate),parseInt(currentbillno)]);


    if(typeof(original_selected_bookings)=='string'){
        let ticket=parseInt(original_selected_bookings);
        selected_hotel_bookings.push(ticket);
    }
    else{
        for(let j=0;j<original_selected_bookings.length;j++){
            
            let ticket=parseInt(original_selected_bookings[j]);
            
            selected_hotel_bookings.push(ticket);
        };
    }



    selected_hotel_bookings.forEach((ticket1)=>{
        ticket1=parseInt(ticket1);
        let query_2345=db.query("UPDATE hotel_booking SET hotel_booking_biller_id=$1,hotel_booking_bill_id=$2 WHERE hotel_booking_id=$3",[currentbillerid,currentbillno,ticket1]);
    });

    let query1="SELECT * FROM hotel_booking WHERE hotel_booking_id IN";
    let where_value1="";

    for(let i=0;i<=selected_hotel_bookings.length+1;i++){
        if(i==0){
            where_value1+="(";
        }
        else if(i==selected_hotel_bookings.length+1){
            where_value1+=");";
        }
        else{
            if(i==selected_hotel_bookings.length){
                where_value1+="$"+i;
            }
            else{
                where_value1+="$"+i+",";
            }
        }      
    }
    query1+=where_value1;

    let final_hotel_booking= await db.query(`${query1}`,selected_hotel_bookings);


    let current_customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    console.log("/bill_hotel current customer",current_customer.rows[0]);
    res.render("bill_hotel.ejs",{final_final_hotel_booking:final_hotel_booking.rows,
        customer:current_customer.rows[0],
        sno:1,
        billno:currentbillno,
        currentbill:bills.rows[0],
        final_sac_code:sac_code,
        final_service_charge:service_charge,
        final_service_charge_quantity:service_charge_quantity,
        final_service_charge_rate:service_charge_rate});
});
    
app.post("/bill_air",async(req,res)=>{
        
    let selected_air_ticket=[];
    let service_charge_quantity=req.body.service_charge_quantity;
    let service_charge_rate=req.body.bill_service_charge;
    let service_charge=parseInt(service_charge_quantity)*parseInt(service_charge_rate);
    let original_selected_bookings=req.body.air_tickets;
    let sac_code=parseInt(req.body.sac_code_original);
    let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[parseInt(currentbillno)]);

    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_sac_code = $1 WHERE bill_id = $2;",[parseInt(sac_code),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_quantity = $1 WHERE bill_id = $2;",[parseInt(service_charge_quantity),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_rate = $1 WHERE bill_id = $2;",[parseInt(service_charge_rate),parseInt(currentbillno)]);

    if(typeof(original_selected_bookings)=='string'){
        let ticket=parseInt(original_selected_bookings);
        selected_air_ticket.push(ticket);
    }
    else{
        for(let j=0;j<original_selected_bookings.length;j++){
            
            let ticket=parseInt(original_selected_bookings[j]);
            
            selected_air_ticket.push(ticket);
        };
    }
    
    selected_air_ticket.forEach((ticket)=>{
        ticket=parseInt(ticket);
        let query_1234=db.query("UPDATE air_ticket SET air_ticket_biller_id=$1,air_ticket_bill_id=$2 WHERE air_ticket_id=$3",[currentbillerid,currentbillno,ticket]);
    })
    let query2="SELECT * FROM air_ticket WHERE air_ticket_id IN";
    let where_value2="";
    for(let i=0;i<=selected_air_ticket.length+1;i++){
        if(i==0){
            where_value2+="(";
        }
        else if(i==selected_air_ticket.length+1){
            where_value2+=");";
        }
        else{
            if(i==selected_air_ticket.length){
                where_value2+="$"+i;
            }
            else{
                where_value2+="$"+i+",";
            }
        }      
    }
    query2+=where_value2;
        
    let current_customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[currentbillerid]);

    let final_air_ticket= await db.query(`${query2}`,selected_air_ticket);
    res.render("bill_air_ticket.ejs",{air_ticket:final_air_ticket.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:currentbillno,
            currentbill:bills.rows[0],
            final_service_charge:service_charge,
            final_service_charge_quantity:service_charge_quantity,
            final_service_charge_rate:service_charge_rate});
})

app.post("/bill_package",async(req,res)=>{
        
    let selected_packages=[];
    let service_charge_quantity=0;
    let service_charge_rate=0;
    let service_charge=0;
    let original_selected_packages=req.body.packages;
    let sac_code=parseInt(req.body.sac_code_original);
    let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[parseInt(currentbillno)]);

    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_sac_code = $1 WHERE bill_id = $2;",[parseInt(sac_code),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_quantity = $1 WHERE bill_id = $2;",[parseInt(service_charge_quantity),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_rate = $1 WHERE bill_id = $2;",[parseInt(service_charge_rate),parseInt(currentbillno)]);

    if(typeof(original_selected_packages)=='string'){
        let ticket=parseInt(original_selected_packages);
        selected_packages.push(ticket);
    }
    else{
        for(let j=0;j<original_selected_packages.length;j++){
            
            let ticket=parseInt(original_selected_packages[j]);
            
            selected_packages.push(ticket);
        };
    }
    
    selected_packages.forEach((ticket)=>{
        ticket=parseInt(ticket);
        let query_12345=db.query("UPDATE package_info SET package_biller_id=$1,package_bill_id=$2 WHERE package_id=$3",[currentbillerid,currentbillno,ticket]);
    })
    let query2="SELECT * FROM package_info WHERE package_id IN";
    let where_value2="";
    for(let i=0;i<=selected_packages.length+1;i++){
        if(i==0){
            where_value2+="(";
        }
        else if(i==selected_packages.length+1){
            where_value2+=");";
        }
        else{
            if(i==selected_packages.length){
                where_value2+="$"+i;
            }
            else{
                where_value2+="$"+i+",";
            }
        }      
    }
    query2+=where_value2;
        
    let current_customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    console.log("customer",currentbillerid);

    let final_packages= await db.query(`${query2}`,selected_packages);
    console.log("final packages",final_packages.rows);
    res.render("bill_package.ejs",{package_info:final_packages.rows,
            customer:current_customer.rows[0],
            sno:1,
            final_sac_code:sac_code,
            billno:currentbillno,
            currentbill:bills.rows[0]});
})


app.post("/delete_selected_biller",async(req,res)=>{
    let customer_id=req.body.customer_id;
    try{
        await db.query("DELETE FROM customer_info WHERE customer_id=$1;",[parseInt(customer_id)]);
        let customers=await db.query("SELECT * FROM customer_info order by customer_id desc;");
        res.render("delete_customer.ejs",{customer:customers.rows});
    }
    catch(err){
        let delete_cus=1;
        let customers=await db.query("SELECT * FROM customer_info order by customer_id desc;");
        res.render("delete_customer.ejs",{customer:customers.rows,delete_cus:delete_cus});
    }

})




app.post("/delete_selected_hotel_booking",async(req,res)=>{
    let hotel_booking_id=req.body.hotel_booking_id;
    try{
        await db.query("DELETE FROM hotel_booking WHERE hotel_booking_id=$1;",[parseInt(hotel_booking_id)]);
        res.redirect("/delete_hotel_booking");
    }
    catch(err){
        let delete_hotel=1;
        res.redirect("/delete_hotel_booking");
    }
})

app.post("/delete_selected_bill",async(req,res)=>{
    try{
        let bill_id=req.body.bill_id;
        const customer= await customers();
        let booking_type=await db.query("SELECT bill_booking_type FROM bill_info WHERE bill_id=$1",[parseInt(bill_id)]);
        console.log("booking type",booking_type.rows[0].bill_booking_type);
        if(booking_type.rows[0].bill_booking_type==1){
            await db.query("UPDATE air_ticket SET air_ticket_bill_id=NULL WHERE air_ticket_bill_id=$1",[parseInt(bill_id)]);
        }
        else if(booking_type.rows[0].bill_booking_type==2){
            await db.query("UPDATE hotel_booking SET hotel_booking_bill_id=NULL WHERE hotel_booking_bill_id=$1",[parseInt(bill_id)]);
        }
        else if(booking_type.rows[0].bill_booking_type==3){
            await db.query("UPDATE package_info SET package_bill_id=NULL WHERE package_bill_id=$1",[parseInt(bill_id)]);
            console.log("package updated");
        }
        await db.query("DELETE FROM bill_info WHERE bill_id=$1;",[parseInt(bill_id)]);
        let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
        res.render("delete_bill.ejs",{bill:bill.rows,customers:customer});
    }
        catch(err){
        let delete_hotel=1;
        const customer= await customers();
        let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
        res.render("delete_bill.ejs",{bill:bill.rows,customers:customer});
    }    
})

app.post("/edit_selected_bill",async(req,res)=>{
    let bill_id=req.body.bill_id;
    const customer= await customers();
    let bill=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[parseInt(bill_id)]);
    res.render("edit_2_bill.ejs",{bill:bill.rows[0],customer:customer});
})

let selected_customer_id=0;
let date_from="";
let date_to="";

app.post("/final_selected_bill_list",async(req,res)=>{
    if(req.body.selected_customer_id && !req.body.date_from && !req.body.date_to){
        selected_customer_id=req.body.selected_customer_id;
        try{
            let bill_status=1;
            let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 order by bill_id desc;",[selected_customer_id]);
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
        }catch(err){
            let bill_status=0;
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});
    
        }

    }
    else if(req.body.date_from && req.body.date_to && !req.body.selected_customer_id){
        date_from=req.body.date_from;
        date_to=req.body.date_to;
        try{
            let bill_status=1;
            let bills=await db.query("SELECT * FROM bill_info where bill_date Between $1 and $2 order by bill_id desc;",[date_from,date_to]);
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
        }catch(err){
            let bill_status=0;
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});
    
        }
    }
    else if(req.body.selected_customer_id && req.body.date_from && req.body.date_to){
        selected_customer_id=req.body.selected_customer_id;
        date_from=req.body.date_from;
        date_to=req.body.date_to;
        
        try{
            let bill_status=1;
            let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
        }catch(err){
            let bill_status=0;
            let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");
            res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});
            
        }
    }
})

app.get("/return_final_selected_bill_list",async(req,res)=>{
    try{
        let bill_status=1;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }catch(err){
        console.log(err);
        let bill_status=0;
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});

    }
})

app.post("/selected_air_bill",async (req,res)=>{
    try{

        let selected_final_bill_id=req.body.bill_id;
        let final_bills=await db.query("select b.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let final_air_ticket=await db.query("select a.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let current_customer=await db.query("select c.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[selected_final_bill_id]);



        res.render("bill_air_ticket.ejs",{air_ticket:final_air_ticket.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:selected_final_bill_id,
            currentbill:bills.rows[0],
            final_service_charge:final_bills.rows[0].bill_service_charge,
            final_service_charge_quantity:final_bills.rows[0].bill_service_charge_quantity,
            final_service_charge_rate:final_bills.rows[0].bill_service_charge_rate});
    }
    catch(err){
        let bill_status=0;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }

})

app.post("/selected_hotel_bill",async (req,res)=>{
    try{

        let selected_final_bill_id=req.body.bill_id;
        let final_bills=await db.query("select b.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let final_hotel_booking=await db.query("select a.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let current_customer=await db.query("select c.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[selected_final_bill_id]);
        
        res.render("bill_hotel.ejs",{final_final_hotel_booking:final_hotel_booking.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:selected_final_bill_id,
            currentbill:bills.rows[0],
            final_sac_code:final_bills.rows[0].bill_sac_code,
            final_service_charge:final_bills.rows[0].bill_service_charge,
            final_service_charge_quantity:final_bills.rows[0].bill_service_charge_quantity,
            final_service_charge_rate:final_bills.rows[0].bill_service_charge_rate});
    }
    catch(err){
        let bill_status=0;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }
})

app.post("/selected_package",async (req,res)=>{
    try{
        let selected_final_bill_id=req.body.bill_id;
        let final_bills=await db.query("select b.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join package_info as p on p.package_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let final_packages=await db.query("select p.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join package_info as p on p.package_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let current_customer=await db.query("select c.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join package_info as p on p.package_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let bills=await db.query("SELECT * FROM bill_info WHERE bill_id=$1",[selected_final_bill_id]);
        console.log("current customer",current_customer.rows[0]);
        console.log("final packages",final_packages.rows[0]);
        console.log("final bills",final_bills.rows[0]);
        console.log("current bill",bills.rows[0]);


        res.render("bill_package.ejs",{package_info:final_packages.rows,
            customer:current_customer.rows[0],
            sno:1,
            final_sac_code:final_packages.rows[0].package_sac_code,
            billno:bills.rows[0].bill_id,
            currentbill:bills.rows[0]});
    }
    catch(err){
        let bill_status=0;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }


})

app.get("/edit_air_ticket",async(req,res)=>{
    let air_tickets=await db.query("SELECT * FROM air_ticket order by air_ticket_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("edit_1_air_ticket.ejs",{air_ticket:air_tickets.rows,customers:all_customers.rows});
})

let selected_to_edit_air_ticket=0;




let selected_to_edit_customer_id=0;

app.post("/edit_selected_customer",async(req,res)=>{
    selected_to_edit_customer_id=req.body.customer_id;
    let customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[selected_to_edit_customer_id]);
    res.render("edit_2_customer.ejs",{customer:customer.rows[0]});
})




app.get("/edit_hotel_booking",async(req,res)=>{
    let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("edit_1_hotel_booking.ejs",{hotel_booking:hotel_booking.rows,customers:all_customers.rows});
})

let selected_to_edit_hotel_booking=0;
app.post("/edit_selected_hotel_booking",async(req,res)=>{
    selected_to_edit_hotel_booking=req.body.hotel_booking_id;
    let customer=await customers();
    let hotel_booking=await db.query("SELECT * FROM hotel_booking WHERE hotel_booking_id=$1",[selected_to_edit_hotel_booking]);
    res.render("edit_2_hotel_booking.ejs",{booking:hotel_booking.rows[0],customer:customer});
})

app.post("/final_edit_hotel_booking",async(req,res)=>{
    const hotel_booking_customer_name=req.body.hotel_booking_customer_name;
    const hotel_name=req.body.hotel_name;
    const hotel_location=req.body.hotel_location;
    const hotel_nights=req.body.hotel_nights;
    const hotel_check_in_date=req.body.hotel_check_in_date;
    const hotel_check_out_date=req.body.hotel_check_out_date;
    const hotel_booking_biller_id=req.body.hotel_booking_biller_id;
    const hotel_quantity=req.body.hotel_quantity;
    const hotel_rate=req.body.hotel_rate;
    const hotel_sac_code=req.body.hotel_sac_code;
    await db.query("UPDATE hotel_booking SET hotel_booking_customer_name=$1,hotel_name=$2,hotel_location=$3,hotel_nights=$4,hotel_check_in_date=$5,hotel_check_out_date=$6,hotel_booking_biller_id=$7,hotel_quantity=$8,hotel_rate=$9,hotel_sac_code=$10 WHERE hotel_booking_id=$11;",[hotel_booking_customer_name,hotel_name,hotel_location,hotel_nights,hotel_check_in_date,hotel_check_out_date,hotel_booking_biller_id,hotel_quantity,hotel_rate,hotel_sac_code,selected_to_edit_hotel_booking]);
    res.redirect("/hotel_booking_list");

})

app.get("/package",async(req,res)=>{
    let customer=await customers();
    res.render("package.ejs",{customer:customer});
})

app.post("/add_package",async(req,res)=>{
    let package_desc_1=req.body.package_desc_1;
    let package_desc_2=req.body.package_desc_2;
    let package_desc_3=req.body.package_desc_3;
    let package_desc_4=req.body.package_desc_4;
    let package_desc_5=req.body.package_desc_5;
    let package_desc_6=req.body.package_desc_6;
    let package_quantity=req.body.package_quantity;
    let package_rate=req.body.package_rate;
    let package_sac_code=req.body.package_sac_code;
    let package_biller_id=req.body.package_biller_id;
    let customer=await customers();
    let result=await db.query("INSERT INTO package_info(package_desc_1,package_desc_2,package_desc_3,package_desc_4,package_desc_5,package_desc_6,package_quantity,package_rate,package_sac_code,package_biller_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[package_desc_1,package_desc_2,package_desc_3,package_desc_4,package_desc_5,package_desc_6,package_quantity,package_rate,package_sac_code,package_biller_id]);
    res.render("package.ejs",{number: result.rows[0],customer:customer});
})

app.get("/package_list",async(req,res)=>{
    let package_info=await db.query("SELECT * FROM package_info order by package_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("package_list.ejs",{package_info:package_info.rows,customers:all_customers.rows});
})

app.get("/delete_package",async(req,res)=>{
    let package_info=await db.query("SELECT * FROM package_info order by package_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("delete_package.ejs",{package_info:package_info.rows,customers:all_customers.rows});
})

app.post("/delete_selected_package",async(req,res)=>{
    let package_id=req.body.package_id;
    try{
        await db.query("DELETE FROM package_info WHERE package_id=$1;",[package_id]);
        res.redirect("/delete_package");
    }
    catch(err){
        console.log(err);
    }
        
})


app.get("/edit_package",async(req,res)=>{
    let package_info=await db.query("SELECT * FROM package_info order by package_id desc;");
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_name;");

    res.render("edit_1_package.ejs",{package_info:package_info.rows,customers:all_customers.rows});
})
let selected_to_edit_package_id=0;
app.post("/edit_selected_package",async(req,res)=>{
    selected_to_edit_package_id=req.body.package_id;
    let package_info=await db.query("SELECT * FROM package_info WHERE package_id=$1",[selected_to_edit_package_id]);
    let customer=await customers();
    res.render("edit_2_package.ejs",{package_info:package_info.rows[0],customer:customer});
})

app.post("/final_edit_selected_package",async(req,res)=>{
    const package_desc_1=req.body.package_desc_1;
    const package_desc_2=req.body.package_desc_2;
    const package_desc_3=req.body.package_desc_3;
    const package_desc_4=req.body.package_desc_4;
    const package_desc_5=req.body.package_desc_5;
    const package_desc_6=req.body.package_desc_6;
    const package_quantity=req.body.package_quantity;
    const package_rate=req.body.package_rate;
    const package_sac_code=req.body.package_sac_code;
    const package_biller_id=req.body.package_biller_id;
    await db.query("UPDATE package_info SET package_desc_1=$1,package_desc_2=$2,package_desc_3=$3,package_desc_4=$4,package_desc_5=$5,package_desc_6=$6,package_quantity=$7,package_rate=$8,package_sac_code=$9,package_biller_id=$10 WHERE package_id=$11;",[package_desc_1,package_desc_2,package_desc_3,package_desc_4,package_desc_5,package_desc_6,package_quantity,package_rate,package_sac_code,package_biller_id,selected_to_edit_package_id]);
    res.redirect("/edit_package");

})

app.post("/final_edit_selected_bill",async(req,res)=>{
    const bill_id=req.body.bill_id;
    const bill_date=req.body.bill_date;
    await db.query("UPDATE bill_info SET bill_date=$1 WHERE bill_id=$2;",[bill_date,bill_id]);
    res.redirect("/selected_bill_list");
})

app.post("/return_air_ticket_list",async(req,res)=>{
    let total_cost=req.body.bill_total_cost;
    let bill_id=req.body.bill_id;
    console.log("total cost",total_cost);
    await db.query("UPDATE bill_info SET bill_total_cost=$1 WHERE bill_id=$2;",[total_cost,bill_id]);
    res.redirect("/selected_bill_list");
})

app.post("/return_hotel_booking_list",async(req,res)=>{
    let total_cost=req.body.bill_total_cost;
    let bill_id=req.body.bill_id;
    await db.query("UPDATE bill_info SET bill_total_cost=$1 WHERE bill_id=$2;",[total_cost,bill_id]);
    res.redirect("/selected_bill_list");
})

app.post("/return_package_list",async(req,res)=>{
    let total_cost=req.body.bill_total_cost;
    let bill_id=req.body.bill_id;
    await db.query("UPDATE bill_info SET bill_total_cost=$1 WHERE bill_id=$2;",[total_cost,bill_id]);
    res.redirect("/selected_bill_list");
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})