// let host = 'http://localhost:10000';
let host = 'https://starscounternew-1.onrender.com'

document.getElementById('profile-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const profilePic = document.getElementById('input-profile').files[0];
    const profileDesc = document.getElementById('describsion').value;
    
    if(!profilePic) {
        alert('ви не загрузили файл');
        return;
    }
    const formData = new FormData();
    formData.append('inputProfile', profilePic);
    formData.append('describsion', profileDesc);
    
    try {
        const responseP = await fetch(`${host}/profile-update`, {
            method: 'POST',
            body: formData,
        });

        if (!responseP.ok) {
            throw new Error(`Server error: ${response.statusText}`)
        }

        const result = await responseP.json();
        if (result) {
            window.location.reload();
        }
    }   

    catch(e) {
        console.log(e);
    }
})


// modal blocks in profile

const deleteAccountBTN = document.querySelector('#DeleteAc-btn');
const closeDeleteWrapper = document.querySelector('#closeDeleteWrapper')
const deleteWrapper = document.querySelector('.delete-wrapper');


deleteAccountBTN.onclick = () => {
    deleteWrapper.style.display = 'flex';
}    

closeDeleteWrapper.onclick = () => {
    deleteWrapper.style.display = 'none';
}    
