let loadingRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');

    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    //=>RUN:预加载图片的
    let n = 0,
        len = imgData.length;
    let run = function run(callback) {
        imgData.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', ((++n) / len) * 100 + '%');

                //=>加载完成:执行回调函数(让当前LOADING页面消失)
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        });
    };

    //=>MAX-DELAY:设置最长等待时间（假设10S，到达10S我们看加载多少了，如果已经达到了90%以上，我们可以正常访问内容了，如果不足这个比例，直接提示用户当前网络状况不佳，稍后重试）
    let delayTimer = null;
    let maxDelay = function maxDelay(callback) {
        delayTimer = setTimeout(() => {
            clearTimeout(delayTimer);
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('非常遗憾，当前您的网络状况不佳，请稍后在试！');
            // window.location.href = 'http://www.qq.com';//=>此时我们不应该继续加载图片，而是让其关掉页面或者是跳转到其它页面
        }, 10000);
    };

    //=>DONE:完成
    let done = function done() {
        //=>停留一秒钟再移除进入下一环节
        let timer = setTimeout(() => {
            $loadingBox.remove();
            clearTimeout(timer);

            phoneRender.init();
        }, 1000);
    };

    return {
        init: function () {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

/*PHONE*/
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    //=>点击ANSWER-MARK
    let answerMarkTouch = function answerMarkTouch() {
        //1.REMOVE ANSWER
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();//=>一定要先暂停播放然后再移除，否则即使移除了浏览器也会播放着这个声音

        //2.SHOW HANG
        $hang.css('transform', 'translateY(0rem)');
        $time.css('display', 'block');
        introduction.play();
        computedTime();
    };

    //=>计算播放时间
    let autoTimer = null;
    let computedTime = function computedTime() {
        //=>我们让AUDIO播放,首先会去加载资源,部分资源加载完成才会播放,才会计算出总时间DURATION等信息,所以我们可以把获取信息放到CAN-PLAY事件中
        /*let duration = 0;
        introduction.oncanplay = function () {
            duration = introduction.duration;
        };*/
        autoTimer = setInterval(() => {
            let val = introduction.currentTime,
                duration = introduction.duration;
            //=>播放完成
            if (val >= duration) {
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60);
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(`${minute}:${second}`);
        }, 1000);
    };

    //=>关闭PHONE
    let closePhone = function closePhone() {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };

    return {
        init: function () {
            $phoneBox.css('display', 'block');

            //=>播放BELL
            answerBell.play();
            answerBell.volume = 0.3;

            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        }
    }
})();

/*MESSAGE*/
let messageRender = (function () {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        demonMusic = $('#demonMusic')[0];

    let step = -1,//=>记录当前展示信息的索引
        total = $messageList.length + 1,//=>记录的是信息总条数(自己发一条所以加1)
        autoTimer = null,
        interval = 1500;//=>记录信息相继出现的间隔时间

    //=>展示信息
    let tt = 0;
    let showMessage = function showMessage() {
        ++step;
        if (step === 2) {
            //=>已经展示两条了:此时我们暂时结束自动信息发送，让键盘出来，开始执行手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');
        if (step >= 3) {
            //=>展示的条数已经是四条或者四条以上了,此时我们让WRAPPER向上移动(移动的距离是新展示这一条的高度)
            /*let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH);*/
            //=>JS中基于CSS获取TRANSFORM，得到的结果是一个矩阵
            let curH = $cur[0].offsetHeight;
            tt -= curH;
            $wrapper.css('transform', `translateY(${tt}px)`);
        }
        if (step >= total - 1) {
            //=>展示完了
            clearInterval(autoTimer);
            closeMessage();
        }
    };

    //=>手动发送
    let handleSend = function handleSend() {
        $keyBoard.css({
            transform: 'translateY(0)'
        }).one('transitionend', () => {
            //=>TRANSITION-END:监听当前元素TRASITION动画结束的事件(并且有几个样式属性改变，并且执行了过渡效果，事件就会被触发执行几次 =>用ONE方法做事件绑定,只会让其触发一次)
            let str = '好的，马上介绍！',
                n = -1,
                textTimer = null;
            textTimer = setInterval(() => {
                let orginHTML = $textInp.html();
                $textInp.html(orginHTML + str[++n]);
                if (n >= str.length - 1) {
                    //=>文字显示完成
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 100);
        });
    };

    //=>点击SUBMIT
    let handleSubmit = function handleSubmit() {
        //=>把新创建的LI增加到页面中第二个LI的后面
        $(`<li class="self">
            <i class="arrow"></i>
            <img src="img/zf_messageStudent.png" alt="" class="pic">
            ${$textInp.html()}
        </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li');//=>重要:把新的LI放到页面中,我们此时应该重新获取LI，让MESSAGE-LIST和页面中的LI正对应，方便后期根据索引展示对应的LI

        //=>该消失的消失
        $textInp.html('');
        $submit.css('display', 'none');
        $keyBoard.css('transform', 'translateY(3.7rem)');

        //=>继续向下展示剩余的消息
        autoTimer = setInterval(showMessage, interval);
    };

    //=>关掉MESSAGE区域
    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(() => {
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);

            cubeRender.init();
        }, interval);
    };

    return {
        init: function () {
            $messageBox.css('display', 'block');

            //=>加载模块立即展示一条信息,后期间隔INTERVAL在发送一条信息
            showMessage();
            autoTimer = setInterval(showMessage, interval);

            //=>SUBMIT
            $submit.tap(handleSubmit);

            //=>MUSIC
            demonMusic.play();
            demonMusic.volume = 0.3;
        }
    }
})();
  let cubeRender=(function(){
      let $cubeBox=$('.cubeBox'),
          $cube=$cubeBox.find('.cube'),
          $cubeList=$cube.find('li');
      let start=function start(ev){
          //=>记录开始按下的数据
          let point=ev.changedTouches[0];
          this.strX=point.clientX;
          this.strY=point.clientY;
          this.changeX=0;
          this.changeY=0;
      };
      let move=function move(ev){
          //记录移动的距离
          let point=ev.changedTouches[0];
          this.changeX=point.clientX-this.strX;
          this.changeY=point.clientY-this.strY;
      };
      let end=function end(ev){
          //=>按照移动的距离让盒子旋转
          let {changeX,changeY,rotateX,rotateY}=this;
          let isMove=false;
          Math.abs(changeX)>10||Math.abs(changeY)>10?isMove=true:null;
          if(isMove){
              //1.左右滑=>CHANGE-X=>ROTATE-Y (正比:CHANGE越大ROTATE越大)
              //2.上下滑=>CHANGE-Y=>ROTATE-X (反比:CHANGE越大ROTATE越小)
              //3.为了让每一次操作旋转角度小一点，我们可以把移动距离的1/3作为旋转的角度即可
              rotateX=rotateX-changeY/3;
              rotateY=rotateY+changeX/3;
              $(this).css('transform',`scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
              //=>让当前旋转的角度，成为下一次旋转的起始角度
              this.rotateX=rotateX;
              this.rotateY=rotateY;
          }
          ['strX', 'strY', 'changeX', 'changeY'].forEach(item=>{this[item]=null})





      };
      return {
          init:function(){
              $cubeBox.css('display','block');
              let cube=$cube[0];
                  cube.rotateX=-35;
                  cube.rotateY=35;
           $cube.on('touchstart',start).
                on('touchmove',move).
                on('touchend',end);
           $cubeList.tap(function(){
               $cubeBox.css('display','none');
               let index=$(this).index();
               detailRender.init(index);
           })
          }
      }
  })();
  let detailRender=(function(){
      let $detailBox=$('.detailBox'),
          swiper=null,
          $dl=$('.page1>dl');
      //=>SWIPER-INIT:实现3d滑动效果
      let swiperInit = function swiperInit() {
          swiper = new Swiper('.swiper-container', {
              effect: 'coverflow',
              onInit:move,
              onTransitionEnd:move
          });
      };
      //=>MOVE:实现折叠菜单效果
      let move=function move(swiper){
          //=>swiper:当前创造的实例
          //=>判断当前是否为第一个slide：如果是让3D菜单展开，不是收起3D菜单
          let activeIn=swiper.activeIndex,
              slideAry = swiper.slides;
          if(activeIn===0){
              $dl.makisu({
                  selector:'dd',
                  overlap:0.6,
                  speed:0.8
              });
              $dl.makisu('open');
          }else{
              $dl.makisu({
                  selector:'dd',
                  speed:0
              });
              $dl.makisu('close');
          }
          slideAry.forEach((item,index)=>{
              if(activeIn===index){
                  item.id=`page${index+1}`;
                  return;
              }
              item.id=null;

          })
      };
      return{
          init:function(index=0){
              $detailBox.css('diplay','block');
              if(!swiper){
                  //防止初始化重复
                  swiperInit();
              }
             swiper.slideTo(index,0)

          }
      }
  })();
  /*以后再真实项目中，如果页面中有滑动的需求，我们一定要把documen本身滑动的默认行为阻止掉不阻止：浏览器中预览，会触发下拉刷新或者左右滑动切换页卡等功能）*/
$(document).on('touchstart touchmove touchend',(ev)=>{
    ev.preventDefault();
});
//=>在开发的过程中，由于开发的项目板块过多，（每个板块都是一个单例）我们最好规划一中机制，通过标识可以让程序运行那一种板块的内容，（哈希路由控制）
let url=window.location.href,
    well=url.indexOf('#'),
    hash=well===-1?null:url.substr(well+1);
switch (hash){
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message' :
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();
}












