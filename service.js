const search =
document.getElementById("serviceSearch");

search.addEventListener(
"input",
() => {

    const keyword =
    search.value.toLowerCase();

    const cards =
    document.querySelectorAll(".card");

    cards.forEach(card => {

        const text =
        card.textContent
        .toLowerCase();
        
        if(text.includes(keyword)){

card.style.display = "block";

card.style.animation = "fadeUp .35s ease";

}else{

card.style.display = "none";

}


    });

});