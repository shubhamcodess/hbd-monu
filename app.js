$(document).ready(function() {
    var frameRate = 30;
    var dt = 1.0 / frameRate;
    var DEG_TO_RAD = Math.PI / 180;
    var RAD_TO_DEG = 180 / Math.PI;
    var colors = [
        ["#df0049", "#660671"],
        ["#00e857", "#005291"],
        ["#2bebbc", "#05798a"],
        ["#ffd200", "#b06c00"]
    ];

    function Vector2(_x, _y) {
        this.x = _x, this.y = _y;
        this.Length = function() {
            return Math.sqrt(this.SqrLength());
        }
        this.SqrLength = function() {
            return this.x * this.x + this.y * this.y;
        }
        this.Equals = function(_vec0, _vec1) {
            return _vec0.x == _vec1.x && _vec0.y == _vec1.y;
        }
        this.Add = function(_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
        }
        this.Sub = function(_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
        }
        this.Div = function(_f) {
            this.x /= _f;
            this.y /= _f;
        }
        this.Mul = function(_f) {
            this.x *= _f;
            this.y *= _f;
        }
        this.Normalize = function() {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / Math.sqrt(sqrLen);
                this.x *= factor;
                this.y *= factor;
            }
        }
        this.Normalized = function() {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / Math.sqrt(sqrLen);
                return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
        }
    }
    Vector2.Lerp = function(_vec0, _vec1, _t) {
        return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
    }
    Vector2.Distance = function(_vec0, _vec1) {
        return Math.sqrt(Vector2.SqrDistance(_vec0, _vec1));
    }
    Vector2.SqrDistance = function(_vec0, _vec1) {
        var x = _vec0.x - _vec1.x;
        var y = _vec0.y - _vec1.y;
        return (x * x + y * y + z * z);
    }
    Vector2.Scale = function(_vec0, _vec1) {
        return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
    }
    Vector2.Min = function(_vec0, _vec1) {
        return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
    }
    Vector2.Max = function(_vec0, _vec1) {
        return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
    }
    Vector2.ClampMagnitude = function(_vec0, _len) {
        var vecNorm = _vec0.Normalized;
        return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
    }
    Vector2.Sub = function(_vec0, _vec1) {
        return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
    }

    function EulerMass(_x, _y, _mass, _drag) {
        this.position = new Vector2(_x, _y);
        this.mass = _mass;
        this.drag = _drag;
        this.force = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.AddForce = function(_f) {
            this.force.Add(_f);
        }
        this.Integrate = function(_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
        }
        this.CurrentForce = function(_pos, _vel) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
        }
    }

    function ConfettiPaper(_x, _y) {
        this.pos = new Vector2(_x, _y);
        this.rotationSpeed = Math.random() * 600 + 800;
        this.angle = DEG_TO_RAD * Math.random() * 360;
        this.rotation = DEG_TO_RAD * Math.random() * 360;
        this.cosA = 1.0;
        this.size = 5.0;
        this.oscillationSpeed = Math.random() * 1.5 + 0.5;
        this.xSpeed = 40.0;
        this.ySpeed = Math.random() * 60 + 50.0;
        this.corners = new Array();
        this.time = Math.random();
        var ci = Math.round(Math.random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        for (var i = 0; i < 4; i++) {
            var dx = Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
        }
        this.Update = function(_dt) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = Math.cos(DEG_TO_RAD * this.rotation);
            this.pos.x += Math.cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y) {
                this.pos.x = Math.random() * ConfettiPaper.bounds.x;
                this.pos.y = 0;
            }
        }
        this.Draw = function(_g) {
            if (this.cosA > 0) {
                _g.fillStyle = this.frontColor;
            } else {
                _g.fillStyle = this.backColor;
            }
            _g.beginPath();
            _g.moveTo(this.pos.x + this.corners[0].x * this.size, this.pos.y + this.corners[0].y * this.size * this.cosA);
            for (var i = 1; i < 4; i++) {
                _g.lineTo(this.pos.x + this.corners[i].x * this.size, this.pos.y + this.corners[i].y * this.size * this.cosA);
            }
            _g.closePath();
            _g.fill();
        }
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
        this.particleDist = _dist;
        this.particleCount = _count;
        this.particleMass = _mass;
        this.particleDrag = _drag;
        this.particles = new Array();
        var ci = Math.round(Math.random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.xOff = Math.cos(DEG_TO_RAD * _angle) * _thickness;
        this.yOff = Math.sin(DEG_TO_RAD * _angle) * _thickness;
        this.position = new Vector2(_x, _y);
        this.prevPosition = new Vector2(_x, _y);
        this.velocityInherit = Math.random() * 2 + 4;
        this.time = Math.random() * 100;
        this.oscillationSpeed = Math.random() * 2 + 2;
        this.oscillationDistance = Math.random() * 40 + 40;
        this.ySpeed = Math.random() * 40 + 80;
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
        this.Update = function(_dt) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += Math.cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = Math.sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
                var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                dirP.Normalize();
                dirP.Mul((delta / _dt) * this.velocityInherit);
                this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
                this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
                var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                rp2.Sub(this.particles[i - 1].position);
                rp2.Normalize();
                rp2.Mul(this.particleDist);
                rp2.Add(this.particles[i - 1].position);
                this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                this.Reset();
            }
        }
        this.Reset = function() {
            this.position.y = -Math.random() * ConfettiRibbon.bounds.y;
            this.position.x = Math.random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = Math.random() * 2 + 4;
            this.time = Math.random() * 100;
            this.oscillationSpeed = Math.random() * 2.0 + 1.5;
            this.oscillationDistance = Math.random() * 40 + 40;
            this.ySpeed = Math.random() * 40 + 80;
            var ci = Math.round(Math.random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
        }
        this.Draw = function(_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
                var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                    _g.fillStyle = this.frontColor;
                    _g.strokeStyle = this.frontColor;
                } else {
                    _g.fillStyle = this.backColor;
                    _g.strokeStyle = this.backColor;
                }
                if (i == 0) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                    _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                    _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x, p1.y);
                    _g.lineTo(p0.x, p0.y);
                    _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else if (i == this.particleCount - 2) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                    _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                    _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x, p1.y);
                    _g.lineTo(p0.x, p0.y);
                    _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                    _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                    _g.lineTo(p1.x, p1.y);
                    _g.lineTo(p0.x, p0.y);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                }
            }
        }
        this.Side = function(x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
        }
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);
    confetti = {};
    confetti.Context = function(parent) {
        var i = 0;
        var canvasParent = document.getElementById(parent);
        var canvas = document.createElement('canvas');
        canvas.width = canvasParent.offsetWidth;
        canvas.height = canvasParent.offsetHeight;
        canvasParent.appendChild(canvas);
        var context = canvas.getContext('2d');
        var interval = null;
        var confettiRibbonCount = 7;
        var rpCount = 30;
        var rpDist = 8.0;
        var rpThick = 8.0;
        var confettiRibbons = new Array();
        ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
        for (i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(Math.random() * canvas.width, -Math.random() * canvas.height * 2, rpCount, rpDist, rpThick, 45, 1, 0.05);
        }
        var confettiPaperCount = 25;
        var confettiPapers = new Array();
        ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
        for (i = 0; i < confettiPaperCount; i++) {
            confettiPapers[i] = new ConfettiPaper(Math.random() * canvas.width, Math.random() * canvas.height);
        }
        this.resize = function() {
            canvas.width = canvasParent.offsetWidth;
            canvas.height = canvasParent.offsetHeight;
            ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
            ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
        }
        this.start = function() {
            this.stop()
            var context = this
            this.interval = setInterval(function() {
                confetti.update();
            }, 1000.0 / frameRate)
        }
        this.stop = function() {
            clearInterval(this.interval);
        }
        this.update = function() {
            var i = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < confettiPaperCount; i++) {
                confettiPapers[i].Update(dt);
                confettiPapers[i].Draw(context);
            }
            for (i = 0; i < confettiRibbonCount; i++) {
                confettiRibbons[i].Update(dt);
                confettiRibbons[i].Draw(context);
            }
        }
    }
    var confetti = new confetti.Context('confetti');
    confetti.start();
    $(window).resize(function() {
        confetti.resize();
    });
});


// ------------------


const songsLength = 11



function playPause() {
    var audio = document.getElementById("audio");
    audio.load()
  var playPauseBtn = document.getElementById("play-pause-btn");
  let current = playPauseBtn.innerHTML;
  current.replace(/\s/g, '');
  current.replace(/(\r\n|\n|\r)/gm, "");
  console.log('currently ', current);
  if (current === "play_arrow") {
    playPauseBtn.innerHTML = "pause";
    console.log('playPauseBtn set to ',   playPauseBtn.innerHTML)
    audio.play();
    console.log('audio played');
  } else {
    playPauseBtn.innerHTML = "play_arrow";
    console.log('playPauseBtn set to ',   playPauseBtn.innerHTML)
    audio.pause();
    console.log('audio paused');

  }
}

function pause(){
    // audio.pause();
}


function getCurrSongSrcIdx(){
    var audio = document.getElementById("audio");
    let currSrcIdx = audio.src
    // currSrcIdx = currSrcIdx.substring(currSrcIdx.length - 5, currSrcIdx.length-4)
    const subWord = 'hbd-song-'
    currSrcIdx = currSrcIdx.slice(currSrcIdx.indexOf(subWord)+subWord.length)
    console.log('currSrcIdx in  getCurrSongSrcIdx() before', currSrcIdx);
    currSrcIdx = currSrcIdx.replace('.mp3',"")
    console.log('currSrcIdx in  getCurrSongSrcIdx()', currSrcIdx);
    return currSrcIdx;
}

function getNextSongSrcIdx(curIdx,ops){

    let nextSongSrcIdx;

    console.log('curIdx got', curIdx);
    console.log('ops got', ops);
        if(ops === 'next'){
        nextSongSrcIdx = Number(curIdx) + 1
    }
        else nextSongSrcIdx = Number(curIdx) -1  ;
    
    if(nextSongSrcIdx > songsLength ){
        nextSongSrcIdx = Number(nextSongSrcIdx) % Number(songsLength) ;}
        else if(nextSongSrcIdx <= 0){
            nextSongSrcIdx = Number(nextSongSrcIdx) % Number(songsLength) + 1;
        }
return nextSongSrcIdx;
}

function getNextSongSrc(idx){
    return './resource/hbd-song-'+idx+'.mp3';
}

function nextSong(){
    var playPauseBtn = document.getElementById("play-pause-btn");
    let currSrcIdx = this.getCurrSongSrcIdx()
    console.log('currSrcIdx', currSrcIdx);
    let nextSongSrcIdx = this.getNextSongSrcIdx(currSrcIdx, 'next')
    console.log('nextSongSrcIdx', nextSongSrcIdx)
    playPauseBtn.innerHTML = "play_arrow";
    audio.src = this.getNextSongSrc(nextSongSrcIdx)

    playPause()
}

function prevSong(){
    var playPauseBtn = document.getElementById("play-pause-btn");
    playPauseBtn.innerHTML = "play_arrow";

        let currSrcIdx = this.getCurrSongSrcIdx()
    console.log('currSrcIdx', currSrcIdx);
    let nextSongSrcIdx = this.getNextSongSrcIdx(currSrcIdx, 'prev')
    console.log('nextSongSrcIdx', nextSongSrcIdx)

    audio.src = this.getNextSongSrc(nextSongSrcIdx)

    playPause()

}

const themeRange = [1,2,3,4,5];
const themeBaseClass= "body-pattern-";

function shuffleTheme(){

    let body = document.getElementsByTagName("body");
    let currClass = "1"
    document.body.classList.forEach(c => currClass=c );
    currClass = currClass.substring(currClass.length-1, currClass.length)
    console.log('currClass: ', currClass)

    let nextClass;

    if(currClass >= themeRange.length){
        nextClass = currClass % themeRange.length + 1
    }else{
        nextClass = Number(currClass) + 1;
    }

    console.log('nextClass', nextClass)

    let nextClassName = themeBaseClass+nextClass;
    console.log('nextClassName', nextClassName)
    document.body.classList.forEach(c => document.body.classList.remove(c))
    document.body.classList.add(nextClassName);

    console.log(document.body.classList)

}

const picLength = 6;


function getCurrPicIdx(pic){
    let currentPicIdx = pic.replace('url("resource/rm-',"");
currentPicIdx = currentPicIdx.substring(0,1);
return currentPicIdx;
}

function getNextPicIdx(currPicIdx){
    let nextPicIdx;
    if(currPicIdx >= picLength){
        nextPicIdx = Number(currPicIdx) % picLength + 1
    }else nextPicIdx = Number(currPicIdx)+1

    return nextPicIdx;
}


function getBackgroundUrlValue(idx){
    return 'url("resource/rm-'+idx+'.jpg")';
}

function nextPic(){
let pic = document.getElementById("image").style.background;
// url("resource/rm-1.png")
let currPicIdx = this.getCurrPicIdx(pic)
console.log('currentPicIdx',currPicIdx)

let nextPicIdx = this.getNextPicIdx(currPicIdx)
console.log('nextPicIdx in next', nextPicIdx)

document.getElementById("image").style = 'background: '+ this.getBackgroundUrlValue(nextPicIdx)+'; background-repeat: no-repeat; background-size: cover;';


}

function prevPic(){
    let pic = document.getElementById("image").style.background;
let currPicIdx = this.getCurrPicIdx(pic)
console.log('currentPicIdx',currPicIdx)
let nextPicIdx = this.getNextPicIdx(currPicIdx)
console.log('nextPicIdx in prev', nextPicIdx)
console.log(this.getBackgroundUrlValue(nextPicIdx)+'; background-repeat: no-repeat; background-size: cover;');
document.getElementById("image").style = 'background: '+ this.getBackgroundUrlValue(nextPicIdx)+'; background-repeat: no-repeat; background-size: cover;';





}
