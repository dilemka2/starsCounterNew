// let host = 'http://localhost:10000';
let host = 'https://starscounternew-1.onrender.com'


// making responsible menu 

const menuBtn = document.querySelector('#menu-icon')
const header = document.querySelector('header')

menuBtn.addEventListener('click', () => {
    header.classList.toggle('activeForMenu');
})

// making animation on main site

const anImg = document.querySelector('.info-img');
const anBtn = document.querySelector('#AnBtn');
if (anBtn) {
    anBtn.addEventListener('mouseenter', () => {
        anImg.style.left = '0';
    });
    anBtn.addEventListener('mouseleave', () => {
        anImg.style.left = '-820px';
    });   
}

// making modal blockss
let progressLine = document.querySelector('.progress-line');
let progress = document.querySelector('.progress');
let warningBlock = document.querySelector('#warningBlock-wrapper')

let resultBlock = document.querySelector('#resultBlock-wrapper');
let resultBlockIn = document.querySelector('.resultBlock')
let resultImg = document.querySelector('.result-img');
let resultH2 = document.querySelector('.ResultH2');
document.querySelector('#close').addEventListener('click', () =>{
    warningBlock.style.display = 'none';
    progress.style.width = '100%';
}) ;

function progressUpdating() {
    let amount = 100;
    progress.style.display = 'block';
    progress.style.width = amount + '%';
    setTimeout(() => {
        let interval = setInterval(() => {
            if (amount == 0) {
                warningBlock.style.display = 'none';
                clearInterval(interval);
            }
            else {
                amount = amount - 10;
                progress.style.width = amount + '%';
            }
        }, 300)
    }, 600)
}


document.getElementById('form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const file = document.getElementById('input').files[0];
    if (!file) {
        warningBlock.style.display = 'flex';
        progressUpdating();
        return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    anBtn.style.opacity = '0';
    setTimeout(() => {
        anBtn.style.display='none'
    }, 200);
    try {
        const response = await fetch(`${host}/send-photo`, {
            method: 'POST',
            body:formData,
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`)
        }
        const result = await response.json();

        if (result) {
            resultBlock.style.display = 'flex';
            progress.style.display = 'none';
            resultImg.src = `/uploads/${result.greyImagePath}`;
            const img = document.querySelector('.preview');
            img.style.display = 'none';
            anBtn.style.display='block';
            setTimeout(() => {
                anBtn.style.opacity='1';
            }, 200);

            resultH2.innerText = `Успішно було знайдено ${result.whiteObjectsCount} зірки!`;
            let closeBTN = document.createElement('button');
            resultBlockIn.appendChild(closeBTN);
            closeBTN.innerHTML = `<i class='bx bx-x' style='color:#ffffff' ></i>`
            closeBTN.classList.add('btn');
            closeBTN.onclick = () => {resultBlock.style.display='none';closeBTN.remove()};
        }
    }

    catch(e) {
        console.log(e);
    }
})


// review block
const MistakeReviewBlock = document.querySelector('.Mistakereview-block-wrapper')
const MistakeReviewProgress = document.querySelector('.review-progress');
const closeReviewBTN = document.querySelector('#closeReviewBTN').addEventListener('click', () => {
    MistakeReviewBlock.style.transition = '.5s'
    setTimeout(() => {
        MistakeReviewBlock.style.transform = 'scale(0)';
    }, 200)
})
const NoAccountreviewBTN = document.querySelector('#NoAccountReviewBTN')
const ReviewBlock = document.querySelector('.review-form');
const AccountreviewBTN = document.querySelector('#AccountReviewBTN')
if (AccountreviewBTN) {
    AccountreviewBTN.addEventListener('click', () => {
        ReviewBlock.classList.toggle('active');
    })
}
if (NoAccountreviewBTN) {
    NoAccountreviewBTN.addEventListener('click', ()=> {
        showingMistake()
        NoAccountreviewBTN.style.zIndex = '-10';
    })
}

function showingMistake() {
    MistakeReviewBlock.style.transition = '.5s';
    setTimeout(() => {
        setTimeout(() => {
            MistakeReviewBlock.style.transform = 'scale(1)'
        },200)
        MistakeReviewBlock.style.display = 'block'
    }, 200);
    let amount = 100;
    MistakeReviewProgress.style.width = amount + '%';
   setTimeout(() => {
    let interval = setInterval(() => {
        if (amount == 0) {
            MistakeReviewBlock.style.transform = 'scale(0)'
            setTimeout(() => {
                MistakeReviewBlock.style.display = 'none';
            }, 200);
            NoAccountreviewBTN.style.zIndex = '1';
            clearInterval(interval);
        }
        amount = amount - 10;
        MistakeReviewProgress.style.width = amount + '%';
    }, 400);
   }, 600);
}


document.querySelector('#input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.querySelector('.preview');
            img.style.display = 'block';
            img.src = e.target.result;
        }
        reader.readAsDataURL(file)
    }
})

