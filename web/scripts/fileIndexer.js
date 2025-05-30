const sharedFolder = '/shared';

const eventSource = new EventSource('/events');

eventSource.onmessage = async () => {
    await reloadPage();
};

async function reloadPage(){
    await loadPage();
}

function clearPage(){
    const elements = document.getElementsByClassName('shared-list-item');
    const elementsArray = Array.from(elements);
    for (let i = elementsArray.length - 1; i >= 0; i--) {
    elementsArray[i].remove();
    }
}

window.onload = async () => {
    await reloadPage();
};

async function loadPage(){
    clearPage();
    const response = await fetch(sharedFolder);
    const data = await response.json();
   
    console.log(data);
    data.forEach(element => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        const div = document.createElement('div');
        div.className = 'controls-div';

        const close_img = document.createElement('img');

        const fileExt = element.split('.').pop();
        
        let extDisplay = document.createElement('span');
        extDisplay.textContent = fileExt;
        extDisplay.className = 'ext-display'

        let preview = document.createElement('img');
        preview.className = 'preview-img';
        if (fileExt == 'png' || 
            fileExt == 'jpg' || 
            fileExt == 'bmp'
        ){
            preview.src = '../img/preview.png';
            preview.className = 'preview-img';

            preview.onclick = () => {
                const src = `${sharedFolder}/${a.textContent.trim()}`
                window.open(`/view-image?src=${encodeURIComponent(src)}`, '_blank');
            }
        }else{
            preview.className = 'preview-img empty-preview';
        }
        
        close_img.src = '../img/remove.png';
        close_img.className = 'close-img';
        
        
        li.className = 'shared-list-item';
        a.onclick = () => downloadFile(li);
        close_img.onclick = () => RemoveFile(a);
        
        a.className = 'shared-list-link';
        a.href = '#';
        a.textContent = element;
        
        li.append(a);

        if (extDisplay != null){
            div.append(extDisplay);
        }

        if (preview != null){
            div.append(preview);
        }

        div.appendChild(close_img);
        li.append(div);

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

async function RemoveFile(element){
    const fileName = element.textContent.trim();
    const url = `${sharedFolder}/${fileName}`;

    fetch(url,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName })
    })
    .then(res => async function(){
            if (res.status == 200){
                await reloadPage();
            }
    })
    .catch(err => {
        console.error(err);
    });
}