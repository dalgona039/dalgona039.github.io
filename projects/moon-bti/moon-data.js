/* Moon-BTI (문BTI) — data + calculator, ported 1:1 from the Flutter source:
   lib/data/mbti_data.dart, lib/models/mbti_calculator.dart, lib/models/question.dart
   Values reproduced verbatim. */
(function () {
  "use strict";

  // questions[] — id, axis, text, weight, direction (verbatim from mbti_data.dart)
  var questions = [
    { id:'Q1',  axis:'ei', dir:'e', w:1.0, text:'북적이는 카페 창가에서 사람들을 관찰하며 영감을 얻는다.' },
    { id:'Q2',  axis:'ei', dir:'i', w:1.0, text:'나만의 밀실에 숨어들 때 진짜 문장이 터져 나온다.' },
    { id:'Q3',  axis:'ei', dir:'e', w:1.0, text:'내 글이 세상의 뜨거운 비평과 찬사를 동시에 받는 상상을 하면 설렌다.' },
    { id:'Q4',  axis:'ei', dir:'i', w:1.0, text:'보여주기보다 나를 증명하기 위한 일기를 더 소중히 여긴다.' },
    { id:'Q5',  axis:'ei', dir:'e', w:1.0, text:'토론과 합평 자리에서 내 의견을 직접 밝히며 작품을 성장시킨다.' },
    { id:'Q6',  axis:'ei', dir:'i', w:1.0, text:'사람들의 시선이 닿지 않는 곳에서야 비로소 솔직한 단어가 나온다.' },
    { id:'Q7',  axis:'sn', dir:'s', w:1.0, text:'빵 냄새, 새벽 공기 같은 감각적 묘사에 공을 들인다.' },
    { id:'Q8',  axis:'sn', dir:'s', w:1.0, text:'"인생이란 무엇인가"보다 "오늘 먹은 저녁"이 더 좋은 소재다.' },
    { id:'Q9',  axis:'sn', dir:'n', w:1.0, text:'보이지 않는 거대한 상징과 비유의 세계를 탐험하는 게 즐겁다.' },
    { id:'Q10', axis:'sn', dir:'n', w:1.0, text:'현실보다 몽환적이고 비현실적인 이야기에 더 끌린다.' },
    { id:'Q11', axis:'sn', dir:'s', w:1.0, text:'장면을 쓸 때 인물의 손끝 온도, 벽의 질감까지 묘사해야 마음이 놓인다.' },
    { id:'Q12', axis:'sn', dir:'n', w:1.0, text:'하나의 장면 뒤에 숨겨진 거대한 은유를 찾아내는 독서가 좋다.' },
    { id:'Q13', axis:'tf', dir:'t', w:1.0, text:'문장은 차갑고 건조할수록 힘이 있다. 감정은 절제해야 한다.' },
    { id:'Q14', axis:'tf', dir:'t', w:1.0, text:"인물이 고난을 겪을 때 '인과관계'와 원인을 먼저 따지게 된다." },
    { id:'Q15', axis:'tf', dir:'f', w:1.0, text:"논리보다 독자의 심장을 요동치게 만드는 '공감'이 본질이다." },
    { id:'Q16', axis:'tf', dir:'f', w:1.0, text:'비합리적인 선택을 해도 마음이 이해된다면 아름답다.' },
    { id:'Q17', axis:'tf', dir:'t', w:1.0, text:'슬픔보다 그 슬픔의 원인과 메커니즘을 분석하는 문장에 끌린다.' },
    { id:'Q18', axis:'tf', dir:'f', w:1.0, text:'인물이 울면 나도 같이 울어야 제대로 된 소설이라 생각한다.' },
    { id:'Q19', axis:'jp', dir:'j', w:1.0, text:'쓰기 전, 이미 머릿속에 마지막 문장과 지도가 그려져 있다.' },
    { id:'Q20', axis:'jp', dir:'j', w:1.0, text:'마감 기한은 독자와의 신성한 약속이므로 루틴을 지킨다.' },
    { id:'Q21', axis:'jp', dir:'p', w:1.0, text:'결말보다 펜이 가는 대로 캐릭터가 이끄는 대로 내버려 둔다.' },
    { id:'Q22', axis:'jp', dir:'p', w:1.0, text:'정돈된 책상보다 무질서한 환경에서 영감이 더 자극된다.' },
    { id:'Q23', axis:'jp', dir:'j', w:1.0, text:'글의 전체 윤곽을 먼저 잡지 않으면 첫 문장조차 쓸 수 없다.' },
    { id:'Q24', axis:'jp', dir:'p', w:1.0, text:'결말을 정하지 않은 채 쓰기 시작할 때 가장 살아 있는 느낌이 든다.' }
  ];

  // authorResults{} — verbatim from mbti_data.dart
  var authorResults = {
    INTJ:{mbti:'INTJ',author:'알베르 카뮈',tagline:'냉철한 실존주의 건축가',description:'당신은 치밀한 구조 위에 실존의 질문을 새기는 작가입니다. 감정을 배제한 듯한 문장 속에 인간의 본질을 담아냅니다.',cardColor:'#2C3E50',work1:'《이방인》',work2:'《페스트》',imageFile:'INTJ.png',quote:'"오늘 엄마가 죽었다. 아니, 어쩌면 어제였는지도 모른다."'},
    INTP:{mbti:'INTP',author:'프란츠 카프카',tagline:'관념의 미로를 헤매는 탐험가',description:'당신은 현실을 낯설게 비틀어 사유의 미로를 만드는 작가입니다. 논리와 부조리가 공존하는 세계를 창조합니다.',cardColor:'#34495E',work1:'《변신》',work2:'《소송》',imageFile:'INTP.png',quote:'"어느 날 아침 그레고르 잠자가 불안한 꿈에서 깨어났을 때, 그는 침대 속에서 한 마리의 거대한 갑충으로 변해 있는 자신을 발견했다."'},
    ENTJ:{mbti:'ENTJ',author:'조지 오웰',tagline:'권력과 언어를 해부하는 지성',description:'당신은 사회 구조를 꿰뚫는 시선으로 세상을 기록하는 작가입니다. 명료하고 단호한 문장으로 진실을 말합니다.',cardColor:'#1A252F',work1:'《1984》',work2:'《동물농장》',imageFile:'ENTJ.png',quote:'"빅 브라더가 당신을 지켜보고 있다."'},
    ENTP:{mbti:'ENTP',author:'이상',tagline:'언어의 경계를 폭파하는 반항아',description:'당신은 기존 형식을 의도적으로 해체하며 새로운 가능성을 실험하는 작가입니다. 역설과 유희가 당신의 무기입니다.',cardColor:'#6C3483',work1:'《날개》',work2:'《오감도》',imageFile:'ENTP.png',quote:'"박제가 되어버린 천재를 아시오? 나는 유쾌하오. 이런 때 연애까지가 유쾌하오."'},
    INFJ:{mbti:'INFJ',author:'도스토옙스키',tagline:'인간 내면의 심연을 탐구하는 자',description:'당신은 인간의 고통과 구원을 치열하게 탐구하는 작가입니다. 영혼의 가장 깊은 곳까지 파고드는 문장을 씁니다.',cardColor:'#4A235A',work1:'《죄와 벌》',work2:'《카라마조프 가의 형제들》',imageFile:'INFJ.png',quote:'"인간이 불행한 것은 자기가 행복하다는 것을 모르기 때문이다."'},
    INFP:{mbti:'INFP',author:'윤동주',tagline:'순수한 영혼의 시인',description:'당신은 부끄러움과 성찰 속에서 시대의 아픔을 노래하는 작가입니다. 맑고 진실한 언어로 독자의 마음을 두드립니다.',cardColor:'#1A5276',work1:'《하늘과 바람과 별과 시》',work2:'〈서시〉',imageFile:'INFP.png',quote:'"죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를, 잎새에 이는 바람에도 나는 괴로워했다."'},
    ENFJ:{mbti:'ENFJ',author:'빅토르 위고',tagline:'인류애를 설파하는 거인',description:'당신은 뜨거운 공감과 웅장한 서사로 독자를 이끄는 작가입니다. 사회의 부조리 앞에서도 인간의 존엄을 외칩니다.',cardColor:'#154360',work1:'《레 미제라블》',work2:'《노트르담의 꼽추》',imageFile:'ENFJ.png',quote:'"인생에서 가장 큰 행복은 우리가 사랑받고 있다는 확신이다."'},
    ENFP:{mbti:'ENFP',author:'셰익스피어',tagline:'삶의 모든 감정을 무대에 올리다',description:'당신은 희극과 비극을 넘나들며 인간의 모든 면을 포착하는 작가입니다. 언어로 세상 전체를 무대 위에 올립니다.',cardColor:'#117A65',work1:'《햄릿》',work2:'《로미오와 줄리엣》',imageFile:'ENFP.png',quote:'"사느냐 죽느냐, 그것이 문제로다."'},
    ISTJ:{mbti:'ISTJ',author:'김훈',tagline:'최소한의 언어로 최대한의 진실',description:'당신은 군더더기 없이 정제된 문장으로 현실을 응시하는 작가입니다. 사실 앞에서 흔들리지 않는 단단한 글을 씁니다.',cardColor:'#212F3D',work1:'《칼의 노래》',work2:'《남한산성》',imageFile:'ISTJ.png',quote:'"버려진 섬마다 꽃이 피었다. 꽃 피는 해안선은 끝없이 전진하는 것 같았다."'},
    ISFJ:{mbti:'ISFJ',author:'나쓰메 소세키',tagline:'일상의 결을 섬세하게 포착하다',description:'당신은 평범한 일상과 인간관계 속 미묘한 감정을 조용히 포착하는 작가입니다. 온기 있는 시선으로 삶을 기록합니다.',cardColor:'#1E3A5F',work1:'《마음》',work2:'《나는 고양이로소이다》',imageFile:'ISFJ.png',quote:'"달이 참 예쁘네요."'},
    ESTJ:{mbti:'ESTJ',author:'찰스 디킨스',tagline:'시대의 불평등을 고발하는 목소리',description:'당신은 구체적이고 생동감 넘치는 묘사로 사회 현실을 직시하는 작가입니다. 강한 서사 의지로 독자를 끝까지 이끕니다.',cardColor:'#1B2631',work1:'《위대한 유산》',work2:'《올리버 트위스트》',imageFile:'ESTJ.png',quote:'"그것은 최고의 시대였고, 최악의 시대였다."'},
    ESFJ:{mbti:'ESFJ',author:'제인 오스틴',tagline:'인간관계의 예리한 관찰자',description:'당신은 날카로운 유머와 따뜻한 시선으로 인간관계를 해부하는 작가입니다. 섬세한 감수성으로 독자의 공감을 이끌어냅니다.',cardColor:'#196F3D',work1:'《오만과 편견》',work2:'《이성과 감성》',imageFile:'ESFJ.png',quote:'"재산이 좀 있는 독신 남자라면 반드시 아내를 원할 것이라는 점은 누구도 부인할 수 없는 보편적인 진리이다."'},
    ISTP:{mbti:'ISTP',author:'아서 코난 도일',tagline:'냉정한 이성으로 진실을 추적하다',description:'당신은 치밀한 관찰과 논리적 추론으로 미스터리를 풀어나가는 작가입니다. 간결하고 명확한 문장이 당신의 강점입니다.',cardColor:'#2E4053',work1:'《주홍색 연구》',work2:'《바스커빌 가문의 개》',imageFile:'ISTP.png',quote:'"불가능한 것들을 제외하고 남은 것은, 아무리 믿기 어려울지라도 진실이다."'},
    ISFP:{mbti:'ISFP',author:'백석',tagline:'감각으로 빚어낸 서정의 화가',description:'당신은 아름다운 감각적 언어로 삶의 찰나를 그림처럼 담아내는 작가입니다. 소박하지만 깊은 정서가 글에 배어납니다.',cardColor:'#4A235A',work1:'《사슴》',work2:'〈나와 나타샤와 흰 당나귀〉',imageFile:'ISFP.png',quote:'"가난한 내가 나타샤를 사랑해서 오늘밤은 푹푹 눈이 나린다."'},
    ESTP:{mbti:'ESTP',author:'헤밍웨이',tagline:'행동과 침묵 사이의 거장',description:'당신은 빙산처럼 많은 것을 숨기고 표면만 드러내는 작가입니다. 군더더기 없는 행동 묘사 속에 거대한 의미를 담습니다.',cardColor:'#1A252F',work1:'《노인과 바다》',work2:'《무기여 잘 있거라》',imageFile:'ESTP.png',quote:'"하지만 인간은 패배하도록 만들어지지 않았다. 인간은 파괴될지언정 패배하지는 않는다."'},
    ESFP:{mbti:'ESFP',author:'김유정',tagline:'삶의 해학과 슬픔을 함께 웃는 자',description:'당신은 고단한 현실도 유머와 생명력으로 풀어내는 작가입니다. 독자의 웃음과 눈물을 동시에 끌어내는 인간미 넘치는 글을 씁니다.',cardColor:'#78281F',work1:'《봄봄》',work2:'《동백꽃》',imageFile:'ESFP.png',quote:'"나의 점순이가 수줍어하는 것은 아니겠지? 그가 나를 그렇게 사랑하던가?"'}
  };

  // MbtiCalculator.calculate — ported 1:1
  function calculate(answers) {
    var ei=0, sn=0, tf=0, jp=0;
    questions.forEach(function (q) {
      var raw = (q.id in answers) ? answers[q.id] : 3;
      var normalized = raw - 3;
      var contribution = normalized * q.w;
      if (q.axis === 'ei') ei += (q.dir === 'e') ? contribution : -contribution;
      else if (q.axis === 'sn') sn += (q.dir === 's') ? contribution : -contribution;
      else if (q.axis === 'tf') tf += (q.dir === 't') ? contribution : -contribution;
      else if (q.axis === 'jp') jp += (q.dir === 'j') ? contribution : -contribution;
    });
    function pick(score, pos, neg) {
      if (score > 0) return pos;
      if (score < 0) return neg;
      return Math.random() < 0.5 ? pos : neg;
    }
    var mbti = pick(ei,'E','I') + pick(sn,'S','N') + pick(tf,'T','F') + pick(jp,'J','P');
    return authorResults[mbti];
  }

  // keyword map from result_screen.dart
  var KEYWORDS = { E:'대화형 화자', I:'독백형 화자', S:'장면 중심 묘사', N:'상징 중심 상상',
    T:'구조적 전개', F:'정서적 공명', J:'치밀한 구성', P:'즉흥적 전개' };

  window.MOON = {
    questions: questions,
    authorResults: authorResults,
    calculate: calculate,
    keywords: function (mbti) { return mbti.split('').map(function (l) { return KEYWORDS[l]; }); },
    likertLabels: ['전혀 아님', '아님', '보통', '그럼', '매우 그럼']
  };
})();
