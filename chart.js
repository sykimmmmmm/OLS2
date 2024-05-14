const BASE_URL = 'http://localhost:4000'
const email = 'saisprn@gmail.com' //admin@gmail.com  dfuturb@gmail.com saisprn@gmail.com
const password = 'tiqh6418*@^' // admin123!@# nvxi6094*#& tiqh6418*@^
const graphType = 'bar'
const field = 'category'

async function login(email,password){
    const userJson = await fetch(`${BASE_URL}/users/login`,{
        headers:{
            'Content-Type':'application/json'
        },
        method: 'POST',
        body: JSON.stringify({email,password})
    })
    const user = await userJson.json()
    return user
}

async function getGroups(field,user){
    let base_url = `${BASE_URL}/history/group`
    if(!user.isAdmin){
        base_url += '/mine'
    }
    // ['borrowAt','expiredAt','returnAt','createdAt','release']
    if(field ==='borrowAt' || field === 'expiredAt' || field === 'returnAt' || field === 'createAt' || field === 'release'){
        base_url += '/date'
    }
    const groupJson = await fetch(`${base_url}/${field}`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${user.token}`
        }
    })
    const group = await groupJson.json()
    return group.docs
}

async function fetchData(email, password, field){
    const user = await login(email,password)
    const group = await getGroups(field,user)
    return group
}

function displayChart(type,group){
    const ctx = document.getElementById('myChart')

    new Chart(ctx,{
        type,
        data: {
            labels: group.filter(item=>item._id !== undefined && item._id !== '')
            .map(item => item._id.year ? `${item._id.year}년 ${item._id.month}월` : 
                 typeof item._id === 'boolean' ? (item._id === true ? "종료" : "진행중") : 
                 item._id.year === null ? '반납하지않음' : item._id),
            datasets: [{
            label: '# of Books',
            data: group.filter(item=>item._id !== undefined && item._id !== '')
            .map(item =>item.count), //날짜
            borderWidth: 1,
            backgroundColor: ['orange','purple','skyblue','green','red','slateblue','pink'],
            // backgroundColor: '#ffD700',
            borderColor:'#111'
        }]
        },
        options: {
            // indexAxis : 'y',//가로방향 그래프
        scales: {
            y: {
            beginAtZero: true
            }
        },
        plugins:{
            colors:{
                enabled:true
            }
        }
        }
    })
}

fetchData(email,password,field)
.then(group =>{
    console.log(group)
    displayChart(graphType,group)
})