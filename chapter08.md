# chapter 08. 기능 이동
### 8.1 함수 옮기기
- 좋은 소프트웨어 설계의 핵심은 모듈화가 얼마나 잘 되어 있느냐를 뜻하는 **모듈성(modularity)**이다. 모듈성이란 프로그램의 어딘가를 수정하려 할 때 해당 기능과 깊이 관련된 작은 일부만 이해하여도 되도록 하는 능력이다. 모듈성을 높이기 위해서는 서로 연관된 요소들을 함께 묶고, 요소 사이의 연결 관계를 쉽게 찾고 이해할 수 있도록 해야 한다.

- 중첩함수를 최상위로 옮기기 - 중첩함수를 사용하다보면 숨겨진 데이터끼리 상호 의존하기가 쉬우니 되도록 만들지 말자
- 다른 클래스로 옮기기 등

컨텍스트의 내용에 따라 함수를 분리할 필요가 있고, 인자를 넘기는 방식으로 함수의 기능에 집중한다. 만약 인자로 넘겨야 하는 데이터가 만다면 데이터를 갖고있는 대상 자체를 넘겼을 것

```javascript
//before
get overdraftCharge(){
  return this.overdraftCharge 
    //-> 이 메서드 내부에서 this.daysOverdrawn을 계속 호출 및 참조
}

//after
get overdraftCharge(){
  return this.type.overdraftCharge(this.daysOverdrawn)
}

//after - this 자체를 인자로 넘겨줌
get overdraftCharge(){
  return this.type.overdraftCharge(this)
}
```

### 8.2 필드 옮기기 
데이터의 구조에 변경이 필요할 때 필드를 옮겨야 한다.
- 함수에 어떤 레코드를 넘길 때마다 또 다른 레코드의 필드도 함께 넘기고 있다면,
- 한 레코드를 변경 할 때 다른 레코드의 필드까지 변경해야만 한다면, (단 한번으로 갱신되지 않고...)

-> 레코드의 위치가 잘못되었다는 신호

case 클래스 구조에서 데이터 필드를 다른 클래스로 이동시키기
```js
//before
Customer{
  constructor(name, discountRate){
    this._name = name
    this._discountRate = discountRate
    this._contract = new CustomerContract(dateToday())
  }
  
  get discountRate(){
    return this._discountRate
  }
}


CustomerContract{
  constract(startDate){
    this._startDate = startDate
  }
}

//step1
Customer{
  constructor(name, discountRate){
    this._name = name
    this._setDiscountRate(discountRate) // <- 캡슐화부터 진행! but, 아직 customerContract class로 부터 discountRate 접근자를 만들지 않아 에러가 날 것! (생성자 선언과 메서드의 위치를 변경시켜 접근자를 먼저 생성하도록 한다)
    this._contract = new CustomerContract(dateToday())
  }
  
  get discountRate(){
    return this._discountRate
  }
  
  _setDiscountRate(num){
    this._discountRate = num
  }
}

//after
CustomerContract{
  constract(startDate, discountRate){ //<- 인자를 추가해서 discountRate를 갖게된다.
    this._startDate = startDate
    this._discountRate = discountRate
  }
   get discountRate(){ //<-메서드 추가
    return this._discountRate
  }
}

//step2
Customer{
  constructor(name, discountRate){
    this._name = name
    this._contract = new CustomerContract(dateToday()) //<- 순서변경함
    this._setDiscountRate(discountRate)
  }
  
  get discountRate(){
    return this._discountRate
  }
  
  _setDiscountRate(num){
    this._contract._discountRate = num //<-생성된 접근자를 통해 discountRate를 지정해 준다.
  }
}


CustomerContract{
  constract(startDate, discountRate){ //<- 인자를 추가해서 discountRate를 갖게된다.
    this._startDate = startDate
    this._discountRate = discountRate
  }
   get discountRate(){
    return this._discountRate
  }
  
  set discountRate(arg){ //<-메서드 추가
    this._discountRate = arg
  }
}
```

### 8.3 문장을 함수로 옮기기
반복, 중복 코드를 함수로 옮긴다. 수정할 일이 있을 때 단 한 곳만 수정하면 된다. 혹시 나중에 코드의 동작이 여러번형들로 나눠야할 순간이 오면 문장을 호출한 곳으로 옮기기(반대 방법)을 적용해 쉽가 다시 뽑아낼 수 있다.

### 8.4 문장을 호출한 곳으로 옮기기
서비스가 고도화되면서 응집도가 높고 한가지 일만 수행하던 함수가 여러 기능을 수행하게 바뀔 수 있다. 추상화의 경계가 변경되는 것이다. 분리했던 함수의 문장들을 호출한 곳으로 옮겨 원복 시킨다.

### 8.5 인라인 코드를 함수 호출로 바꾸기
함수로 여러 동작(명령식)을 묶어준다.
함수의 이름을 잘 지으면 코드의 동작 방식보다 목적을 말해주기 때문에 코드를 이해하기가 쉬워진다. 중복을 없애는데도 효과적이고 특히 라이브러리가 제공하는 함수로 대체할 수 있다면 함수 본문을 작성할 필요조차 없기 때문에 훨씬 좋다.
```javascript
//before
let appliesToMass = false;
for(const s of states){
  if(s === 'MA') appliesToMass = true
}

//after
let appliesToMass = states.includes('MA)
```


### 8.6 문장 슬라이드하기
관련코드끼리 모으는 작업, 맥락과 관련있으며 요소를 선언하는 곳과 사용하는 곳을 가까이 두기. (ex_조건문의 공통실행 코드 빼내기)
부수효과가 없음을 확인하며 작업해야 한다.


### 8.7 반복문 쪼개기
반복문 쪼개기는 서로 다른 일들이 한 함수에서 이뤄지고 있다는 신호이다. 하나의 반복문에서 여러가지의 기능이 실행되고 있어 이를 분리하면 여러번의 반복문이 만들어지게 되는데, 이 점 때문에 이 리팩토링이 불편할 수 있다. 하지만 명심해야할 것은 **리팩토링과 최적화를 구분해야하는 것! 최적화는 코드를 깔끔히 정리한 이후에 수행하자.** 오히려 반복문 쪼개기가 **_더 강력한 최적화_**를 적용할 수 있는 기회가 되기도 한다.
```javascript
//before
let youngest = people[0]?people[0].age:Infinity
let totalSalary = 0
for(const p of people){
  if(p.age<youngest) youngest = p.age
  totalSalary+=p.salary
}


//after
// 1.연관있는 코드끼리 줄바꿈 (문장 슬라이드)
let averageAge = people[0]?people[0].age:Infinity
for(const p of people){
  if(p.age<youngest) youngest = p.age
}

let totalSalary = 0
for(const p of people){
  totalSalary+=p.salary
}

// 2.반복문을 함수로 추출
function youngest(){
  let youngest = 0
  for(const p of people){
    if(p.age<youngest) youngest = p.age
  }
  return youngest
}

function totalSalary(){
  let totalSalary = 0
  for(const p of people){
    totalSalary+=p.salary
  }
  return totalSalary
}

// 3. advanced - 파이프라인 교체, 알고리즘 교체
function totalSalary(){
  return people.reduce((total, p)=>total+p.salary,0)
}

function youngest(){
  return Math.min(...people.map(p=>p.age))
}
```

### 8.8 반복문을 파이프라인으로 바꾸기
대표적 연산 map, filter
map은 컬렉션의 각 원소를 변환하고, filter는 입력 컬렉션을 또 다른 함수로 필터링해 부분집합을 만든다. 이 결과값은 파이프라인의 다음 단계를 위한 컬렉션으로 쓰인다. 객체가 파이프라인을 따라 흐르며 어떻게 처리되는지 읽을 수 있어 이해하기 훨씬 쉬워진다.

### 8.9 죽은 코드 제거하기
굳이 왜 지우냐 > "절대 호출되지 않으니 무시해도 되는 함수다"라는 신호를 주지 않기 위해서.
나중에 사용할 수 도 있지 않냐, 주석처리하지 않으면 되지 않으냐 > 버전관리 시스템을 쓰고 있지 않느냐.