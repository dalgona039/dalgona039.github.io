/* Walk-Fit demo — faithful recreation of the Streamlit frontend behaviour.
   No TF backend; gait signals + model errors are synthesized to demonstrate
   the exact same UI flow (metrics, plotly chart, dataframes, status logic). */
(function () {
  "use strict";

  var INPUT = ['lf_ax','lf_ay','lf_az','rf_ax','rf_ay','rf_az'];
  var OUTPUT = ['pelvis_ax','pelvis_ay','pelvis_az'];
  var COLS = INPUT.concat(OUTPUT);
  var TIME_STEP = 100;

  // deterministic PRNG so the demo is stable across reloads
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  // synthesize realistic cyclic accelerometer data for a walking trial
  function makeTrial(kind){
    var rng = mulberry32(kind === 'normal' ? 12345 : 67890);
    var N = kind === 'normal' ? 612 : 598;
    var stride = kind === 'normal' ? 62 : 58;      // samples per stride
    var irregular = kind === 'normal' ? 0 : 1;      // gait asymmetry for abnormal
    var rows = [];
    var pred = [];                                   // model prediction for pelvis
    for (var i=0;i<N;i++){
      var ph = (2*Math.PI*i)/stride;
      var asym = irregular ? (0.5*Math.sin(ph*0.5)+0.3*Math.sin(ph*1.5+1)) : 0;
      var nz = function(s){return (rng()-0.5)*s;};
      var lf_ax = 0.9*Math.sin(ph)+0.25*Math.sin(2*ph)+nz(0.18);
      var lf_ay = 0.6*Math.cos(ph)+0.2*Math.sin(3*ph+0.4)+nz(0.16);
      var lf_az = 9.81+0.8*Math.sin(ph+0.6)+nz(0.2);
      var rf_ax = 0.9*Math.sin(ph+Math.PI+asym*0.4)+0.25*Math.sin(2*ph)+nz(0.18);
      var rf_ay = 0.6*Math.cos(ph+Math.PI)+0.2*Math.sin(3*ph+1.1)+nz(0.16);
      var rf_az = 9.81+0.8*Math.sin(ph+Math.PI+0.6)+nz(0.2);
      // pelvis = blended foot signals + dynamics (m/s^2 scale, like real IMU)
      var p_ax = 2.6*(lf_ax+rf_ax)*0.5+3.4*Math.sin(ph*0.5)+nz(0.5)+asym*2.4;
      var p_ay = 2.2*(lf_ay+rf_ay)*0.5+2.8*Math.cos(ph*0.5+0.3)+nz(0.45)+asym*2.0;
      var p_az = 9.81+4.6*Math.sin(ph*0.5+0.9)+nz(0.5)+asym*2.6;
      rows.push({lf_ax:lf_ax,lf_ay:lf_ay,lf_az:lf_az,rf_ax:rf_ax,rf_ay:rf_ay,rf_az:rf_az,
                 pelvis_ax:p_ax,pelvis_ay:p_ay,pelvis_az:p_az});
    }
    // model prediction: actual + error; error larger for abnormal gait.
    // tuned so normal avg MAE < 3.0 (정상) and abnormal >= 4.0 (주의가 필요),
    // matching the score_gait_status thresholds in frontend.py.
    var base = kind === 'normal' ? 9.6 : 18.0;
    for (var j=TIME_STEP-1;j<N;j++){
      var r = rows[j];
      var ePh = (2*Math.PI*j)/stride;
      var burst = irregular ? Math.max(0,Math.sin(ePh*0.5))*2.0 : 0;
      pred.push([
        r.pelvis_ax + (rng()-0.5)*base + burst*(rng()*0.9),
        r.pelvis_ay + (rng()-0.5)*base + burst*(rng()*0.8),
        r.pelvis_az + (rng()-0.5)*base + burst*(rng()*1.0)
      ]);
    }
    return {rows:rows, pred:pred, N:N};
  }

  // ---- analysis (mirrors frontend.py) ----
  function analyse(trial){
    var pred = trial.pred, rows = trial.rows;
    var n = pred.length;
    var actual = [], err = [], maePerWin = [];
    for (var i=0;i<n;i++){
      var a = [rows[TIME_STEP-1+i].pelvis_ax, rows[TIME_STEP-1+i].pelvis_ay, rows[TIME_STEP-1+i].pelvis_az];
      actual.push(a);
      var e = [Math.abs(pred[i][0]-a[0]),Math.abs(pred[i][1]-a[1]),Math.abs(pred[i][2]-a[2])];
      err.push(e);
      maePerWin.push((e[0]+e[1]+e[2])/3);
    }
    var avg = maePerWin.reduce(function(s,v){return s+v;},0)/n;
    return {actual:actual, pred:pred, mae:maePerWin, avg:avg, timeIdx:idxRange(TIME_STEP-1,n)};
  }
  function idxRange(start,len){var a=[];for(var i=0;i<len;i++)a.push(start+i);return a;}

  // score_gait_status
  function scoreStatus(avg){
    if (avg < 3.0) return {status:'정상', color:'#21C354'};
    if (avg < 4.0) return {status:'초기 이상 증세', color:'#F0A202'};
    return {status:'주의가 필요', color:'#FF4B4B'};
  }

  function fmt(v,d){return v.toFixed(d===undefined?4:d);}
  function stats(arr){
    var s=arr.slice().sort(function(a,b){return a-b;});
    var n=s.length, mean=arr.reduce(function(x,y){return x+y;},0)/n;
    var sd=Math.sqrt(arr.reduce(function(x,y){return x+(y-mean)*(y-mean);},0)/n);
    var med=n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;
    return {min:s[0],max:s[n-1],mean:mean,std:sd,median:med};
  }

  // ===== rendering =====
  var current = null;

  function render(kind){
    var trial = makeTrial(kind);
    var res = analyse(trial);
    current = {trial:trial, res:res, kind:kind};

    document.getElementById('emptyState').style.display='none';
    document.getElementById('resultState').style.display='block';
    document.getElementById('sbSuccess').style.display='block';
    document.getElementById('loadMsgTxt').textContent = '데이터 로드를 완료하였습니다. '+trial.N;

    // tab 1 metrics
    var st = scoreStatus(res.avg);
    var mStatus = document.getElementById('mStatus');
    mStatus.querySelector('.status-dot').style.background = st.color;
    mStatus.querySelector('span:last-child').textContent = st.status;
    document.getElementById('mAvg').textContent = fmt(res.avg);
    var maeMean = res.mae.reduce(function(s,v){return s+v;},0)/res.mae.length;
    document.getElementById('mMae').textContent = fmt(maeMean);

    // tab 2 error stats table
    var s = stats(res.mae);
    var rowsTbl = [
      ['최소 MAE', fmt(s.min)], ['최대 MAE', fmt(s.max)], ['평균 MAE', fmt(s.mean)],
      ['표준편차', fmt(s.std)], ['중앙값', fmt(s.median)]
    ];
    var tb = document.querySelector('#errStatTable tbody');
    tb.innerHTML = rowsTbl.map(function(r,i){
      return '<tr><td class="idx">'+i+'</td><td class="k">'+r[0]+'</td><td>'+r[1]+'</td></tr>';
    }).join('');

    drawChart(0);
    renderRaw(trial.rows);
    renderDescribe(trial.rows);
  }

  function drawChart(axisIdx){
    if (!current) return;
    var res = current.res;
    var actual = res.actual.map(function(a){return a[axisIdx];});
    var pred = res.pred.map(function(p){return p[axisIdx];});
    var axisName = OUTPUT[axisIdx];
    var traces = [
      {x:res.timeIdx, y:actual, mode:'lines', name:'실제값',
       line:{color:'blue', width:2}},
      {x:res.timeIdx, y:pred, mode:'lines', name:'예측값',
       line:{color:'red', width:2, dash:'dash'}}
    ];
    var layout = {
      title:{text:axisName+' - 예측값 vs 실제값', font:{size:18, family:'Source Sans 3, sans-serif', color:'#31333F'}},
      xaxis:{title:{text:'시간 (샘플)'}, gridcolor:'#ECECEC', zeroline:false},
      yaxis:{title:{text:'가속도'}, gridcolor:'#ECECEC', zeroline:false},
      height:500, margin:{l:60,r:24,t:54,b:50},
      paper_bgcolor:'#fff', plot_bgcolor:'#fff',
      font:{family:'Source Sans 3, sans-serif', color:'#31333F', size:13},
      legend:{orientation:'h', x:0, y:1.08, bgcolor:'rgba(0,0,0,0)'},
      hovermode:'x unified'
    };
    Plotly.react('gaitChart', traces, layout, {responsive:true, displayModeBar:false});
  }

  function renderRaw(rows){
    var head = rows.slice(0,100);
    var html = '<thead><tr><th class="idx"></th>'+COLS.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead><tbody>';
    html += head.map(function(r,i){
      return '<tr><td class="idx">'+i+'</td>'+COLS.map(function(c){return '<td>'+r[c].toFixed(4)+'</td>';}).join('')+'</tr>';
    }).join('');
    html += '</tbody>';
    document.getElementById('rawTable').innerHTML = html;
  }

  function renderDescribe(rows){
    var metrics = ['count','mean','std','min','25%','50%','75%','max'];
    function colStats(c){
      var v = rows.map(function(r){return r[c];}).sort(function(a,b){return a-b;});
      var n=v.length, mean=v.reduce(function(s,x){return s+x;},0)/n;
      var sd=Math.sqrt(v.reduce(function(s,x){return s+(x-mean)*(x-mean);},0)/n);
      var q=function(p){var idx=(n-1)*p,lo=Math.floor(idx),hi=Math.ceil(idx);return v[lo]+(v[hi]-v[lo])*(idx-lo);};
      return {count:n, mean:mean, std:sd, min:v[0], '25%':q(.25), '50%':q(.5), '75%':q(.75), max:v[n-1]};
    }
    var cs = COLS.map(colStats);
    var html = '<thead><tr><th class="idx"></th>'+COLS.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead><tbody>';
    html += metrics.map(function(m){
      return '<tr><td class="idx">'+m+'</td>'+cs.map(function(s){
        var val = m==='count'? String(s.count) : s[m].toFixed(4);
        return '<td>'+val+'</td>';
      }).join('')+'</tr>';
    }).join('');
    html += '</tbody>';
    document.getElementById('descTable').innerHTML = html;
  }

  // ===== interactions =====
  document.querySelectorAll('.demo-btn').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.demo-btn').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      render(b.dataset.sample);
      if (window.matchMedia('(max-width:760px)').matches){
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });
  document.getElementById('browseBtn').addEventListener('click', function(){
    // mimic file dialog by nudging the user to the demo samples
    var dp = document.querySelector('.demo-pick');
    dp.animate([{boxShadow:'0 0 0 0 rgba(255,75,75,.5)'},{boxShadow:'0 0 0 6px rgba(255,75,75,0)'}],{duration:700});
  });

  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
      document.querySelectorAll('.tabpane').forEach(function(x){x.classList.remove('on');});
      t.classList.add('on');
      document.getElementById(t.dataset.tab).classList.add('on');
      if (t.dataset.tab==='t2' && current){ Plotly.Plots.resize('gaitChart'); }
    });
  });

  document.getElementById('axisSel').addEventListener('change', function(e){
    drawChart(parseInt(e.target.value,10));
  });

  var msb = document.getElementById('mobileSbBtn');
  if (msb) msb.addEventListener('click', function(){ document.getElementById('sidebar').classList.toggle('open'); });

  // auto-load the normal sample so the demo opens populated
  window.addEventListener('load', function(){
    var first = document.querySelector('.demo-btn[data-sample="normal"]');
    if (first) first.click();
  });
})();
