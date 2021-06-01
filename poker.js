const readline = require('readline');
class Games {
    constructor(){
        this.data = [
            [1,2,3],
            [4,5,6,7,8],
            [9,10,11,12,13,14,15]
        ]
        this.status = 0
        this.count = 0
        this.players = {}
    }
    /**
     * 将玩家加入游戏
     * @param {*} player 
     * @returns 
     */
    join(player){
        if(this.status>0) return console.log('游戏已开始')
        if(this.count<2) {
            player.join(this)
            this.players[this.count+1] = player
            this.count++
            console.log(player.name + '，加入游戏!')
        }else{
            console.log('准备完成!')
        }
        if(this.count==2) this.status = 1
    }
    /**
     * 游戏开始
     */
    async start(){
        console.log('游戏开始,随机先行')
        let first = Math.ceil(Math.random()*2)
        this.currentId = first
        this.players[first]&& (this.activePlayer = this.players[first])
    }
    /**
     * 发牌
     * @param {*} row 
     * @param {*} num 
     * @returns 
     */
    sendCard(row,num){
        if(this.status==2){
            return this.end()
        }
        if(!row||!num) return console.log('输入不正确')
        if(this.currenRow){
            var curRow = this.data[this.currenRow -1]
            if(curRow&&curRow.length&&this.currenRow != row){
                return console.log('输入不正确')
            }
        }
        var aimRow =  this.data[row -1]
        if(!aimRow || !aimRow.length){
            console.log('该行不存在或者牙签已被取完')
            this.print()
            return 
        }
        var len = aimRow.length > num ? num : aimRow.length
        var data = aimRow.splice(0, len)
        this.print()
        //剩下结果
        var remain = 0
        for(let item of this.data){
            remain+=item.length
        }
        //剩下一根或者没有就可以结束了
        if(remain<=1){
            this.status = 2
            const winnerId = remain ? this.currentId: (this.currentId== 1 ? 2:1)
            console.log(`${this.players[winnerId].name}为赢家`)
            this.end()
        }else{
            this.next()
        }

        this.currenRow = row    
        return {
            [row]:data
        }
    }
    /**
     * 打印剩下的内容
     */
    print(){
        console.log(`剩下：**********`)
        for(let i in this.data){
            console.log(`第${parseInt(i)+1}行：${this.data[i]}`)
        }
        console.log(`*********`)
    }
    /**
     * 交换玩家
     */
    next(){
        this.currentId = this.currentId== 1 ? 2:1
        this.activePlayer = this.players[this.currentId]
        console.log(`轮到${this.players[this.currentId].name}抽取火柴`)
    }
    /**
     * 结束游戏释放玩家对象
     */
    end(){
        for(let k of Object.keys(this.players)){
            this.players[k].quit()
            this.players[k] = null
        }
        this.status = 0
        console.log('本局游戏已结束')
    }
}

/*
* 玩家
*/
class Player {
    constructor(name){
        this.name = name
        this.steps = 0
        this.record = {} //记录签内容
    }
    //抽牌动作,返回输入结果
    takeCard(row,num){
        const res = this.game.sendCard(row,num)
        this.record[this.steps] = res
        this.steps++
    }
    //加入游戏与游戏建立连接
    join(game){
        this.game = game 
    }
    //退出断开游戏连接
    quit(){
        this.game = null
    }
}

/**
 * 主函数
 */
function main(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    let game = new Games()
    let red = new Player('red')
    let blue = new Player('blue')
    game.join(red)
    game.join(blue)
    game.start().then(()=>{
        console.log(`${game.activePlayer.name}先走`)
        rl.setPrompt(`输入行数空格加数量（大于零）：`);
        rl.prompt();
    })
    rl.on('line', function(line){
        const text = line.trim()
        switch(text) {
            case 'esc': //退出命令
                rl.close();
                break;
            default:
                const arr = text.split(' ')
                const row = parseInt(arr[0])
                const num = parseInt(arr[1])
                game.activePlayer.takeCard(row,num)
                break;
        }
        rl.prompt()
    })
    rl.on('close', function() {
        game.end()
        game = null
        red = null
        blue = null
        console.log('游戏结束，bye bye！');
        process.exit(0);
    })
    
}

main()