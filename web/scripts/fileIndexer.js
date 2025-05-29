const sharedFolder = '/shared';

window.onload = async function(){
    const response = await fetch(sharedFolder);
    const data = await response.json();
   
    data.forEach(element => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const close_img = document.createElement('img');

        close_img.src = '../img/remove.png';
        close_img.className = 'close-img';

        
        li.className = 'shared-list-item';
        a.onclick = () => downloadFile(li);
        close_img.onclick = () => RemoveFile(li);
        
        a.className = 'shared-list-link';
        a.href = '#';
        a.textContent = element;


        li.append(a);
        li.appendChild(close_img);

        const ul = document.getElementById('shared-data-list');
        ul.append(li);
    });
};

function downloadFile(element){
    const fileName = element.textContent.trim();
    const url = `${sharedFolder}/${fileName}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function RemoveFile(element){
    const fileName = element.textContent.trim();
    const url = `${sharedFolder}/${fileName}`;

    fetch(url,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName })
    })
    .then(res => {
        if (res.status == 200){
            window.location.reload();
        }
    })
    .catch(err => {
        console.error(err);
    });
}