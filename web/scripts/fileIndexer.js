const sharedFolder = '/shared';

window.onload = async function(){
    const response = await fetch(sharedFolder);
    const data = await response.json();
   
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
                fetch(src)
                .then(res => res.blob())
                .then(blob => {
                    const imgUrl = URL.createObjectURL(blob);

                    const newWindow = window.open('', '_blank');

                    if (newWindow) {
                        newWindow.document.write(`
                            <html>
                                <head><title>${a.textContent.trim()}</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#000;">
                                    <img src="${imgUrl}" style="max-width:100%;max-height:100%;" />
                                </body>
                            </html>
                            `);
                        newWindow.document.close();
                    }

                })
                .catch(error => console.error('Error fetching image:', error));
            }
        }else{
            preview.className = 'preview-img empty-preview';
        }
        
        close_img.src = '../img/remove.png';
        close_img.className = 'close-img';
        
        
        li.className = 'shared-list-item';
        a.onclick = () => downloadFile(li);
        close_img.onclick = () => RemoveFile(li);
        
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