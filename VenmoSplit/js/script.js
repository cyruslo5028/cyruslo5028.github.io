let numberForm = $("#pplNumber");
let nameInput = $("#nameInput");
let priceInput = $("#priceInput");
let result = $("#result");
users=[];
prices = [];
let numberppl = null;
var thread = null;

function promptUser(formSubmitEvent){
    numberppl = $("#number").val();
    console.log("Handle Number People: "+numberppl);
    formSubmitEvent.preventDefault();
    if(numberppl!= null){
        // Clear the form
        numberForm.css('display','none');
        // Prompt User to input the Name and Price
        nameInput.html("");
        rowHTML = "";
        for(let i=0;i<numberppl;++i ){
            rowHTML +="<div class = 'form-group row my-2'>"+
                            "<label class='col-sm-2 col-form-label'>"+(i+1)+". </label>"+
                            "<div class='col-sm-10'>"+
                                "<input type='text' class='form-control' placeholder='Name' id='name"+i+"' required>"+
                            "</div>"+
                        "</div>";
        }
        rowHTML += "<input type='submit' class='btn btn-primary btn-dark mb-2' value='Submit' ></input>";
        nameInput.append(rowHTML);
        nameInput.css('display','block');
    }
}

function updatePrice(){
    // Update the Price for each user
    for(let i = 0;i<numberppl;++i){
        let priceValue = $('#price'+i).val();
        try{
            let price = eval(priceValue);
            if(price == null){
                throw 'ValueError';
            }
            price = (Math.round(price * 100) / 100).toFixed(2);
            let label = $('#priceLabel'+i);
            label.html("Price: $"+price);
        }
        catch{
            let label = $('#priceLabel'+i);
            label.html("Price: $0.00");
        }
    }
    let taxValue = $('#tax').val();
    try{
        let tax = eval(taxValue);
        if(tax == null){
            throw 'ValueError';
        }
        tax = (Math.round(tax * 100) / 100).toFixed(2);
        let label = $('#taxLabel');
        label.html("Tax+Tips: $"+tax);
    }
    catch{
        let label = $('#taxLabel');
        label.html("Tax+Tips: $0.00");
    }
}

function askPrice(formSubmitEvent){
    formSubmitEvent.preventDefault();
    // Get the name from submit
    for(let i=0;i<numberppl;++i){
        let name = $("#name"+i).val();
        users.push(name);
    }
    console.log("Handling price for: "+users);
    // Prompt user to input the price
    nameInput.css('display','none');
    priceInput.html("");
    rowHTML = "";
    for(let i=0;i<numberppl;++i){
        rowHTML +="<div class = 'form-group row my-2'>"+
                        "<label class='col-sm-4 col-form-label'>"+users[i]+"</label>"+
                        "<div class='col-sm-8'>"+
                            "<input type='text' class='form-control' placeholder='Price(e.g. 15.2 or 15.2+10.5)' id='price"+i+"'>"+
                        "</div>"+
                    "</div>"+
                    "<div class= 'row my-2 mx-1' id='priceLabel"+i+"'> Price: $0.00</div>";
                        
    }
    rowHTML +="<div class = 'form-group row my-2'>"+
                    "<label class='col-sm-4 col-form-label'>Tax + Tips</label>"+
                    "<div class='col-sm-8'>"+
                        "<input type='text' class='form-control' placeholder='Tax+Tips (e.g. 5.2 or 2+4.3)' id='tax'>"+
                    "</div>"+
                "</div>"+"<div class= 'row my-2 mx-1' id='taxLabel'> Tax+Tips: $0.00</div>";  
    rowHTML += "<input type='submit' class='btn btn-primary btn-dark mb-2' value='Submit' ></input>";
    priceInput.append(rowHTML);
    priceInput.css('display','block');
    // Threading to update price
    thread = setInterval(updatePrice,1000);
}

function promptResult(formSubmitEvent){
    formSubmitEvent.preventDefault();
    //Stop the thread    
    clearInterval(thread);
    priceInput.css('display','none');
    var total=0.0;
    // Store all the price in an array for calculation
    for(let i=0;i<numberppl;++i){
        let price = $("#priceLabel"+i).text();
        const arr = price.split('$');
        prices.push(parseFloat(arr[1]));
        total += parseFloat(arr[1]);
    }
    let tax = $("#taxLabel").text();
    const arr = tax.split('$');
    tax = parseFloat(arr[1]);
    total += tax;
    console.log("Prices: "+prices);
    console.log("Total: "+total);
    console.log("Tax: "+tax);
    /*
        Calculation:
            Each Person: Price + tax * (Price)/(Total Price w/o tax)
    */
    totalprice=[];
    for(let i=0;i<numberppl;++i){
        let tempP = prices[i] + tax *(prices[i]/total);
        totalprice.push(tempP);
    }
    // Prompt Result
    result.html("");
    rowHTML = "";
    for(let i=0;i<numberppl;++i){
        rowHTML +="<div class = 'form-group row my-2'>"+
                        "<label class='col-sm-2 col-form-label'>"+users[i]+"</label>"+
                        "<div class='col-sm-10'>"+
                            "<input type='text' readonly class='form-control-plaintext' value='$"+((Math.round(totalprice[i] * 100) / 100).toFixed(2))+"' >"+
                        "</div>"+
                    "</div>";
    }
    rowHTML += "<button type='button' class='btn btn-primary btn-dark mb-2' onclick='resetPage()'>Home</button>"
    result.append(rowHTML);
    result.css('display','block');
}

function resetPage(){
    console.log("Reset");
    //Clear all the form and display home page
    numberForm.css('display','block');
    nameInput.css('display','none');
    //nameInput.html("");
    priceInput.css('display','none');
    //priceInput.html("");
    result.css('display','none');
    //result.html("");
}

numberForm.submit(promptUser);
nameInput.submit(askPrice);
priceInput.submit(promptResult);