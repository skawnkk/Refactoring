## chapter06.
###    - 함수선언 바꾸기: 
   유용하고 안전하게 리팩토링하는 방법, **마이그레이션** 
   안전하고 정확성을 기하는 방법, **어서션**
   
###    - 캡슐화하기:
     1) 원본데이터를 변경하지 못하게 하기 : `Object.assign({},property)`
     2) 아예, 데이터를 수정하지 못하게 하기
     
```js
//1) Object.assign

const { log } = console;

let defaultOwner = { firstName: "마틴", lastName: "파울러" };

/*변경 전
function getDefaultOwner(){
  return defaultOwner;
}*/

//변경 후
function getDefaultOwner() {
  return Object.assign({}, defaultOwner);
}

const owner1 = getDefaultOwner();
const owner2 = getDefaultOwner();
owner2.lastName = "김";
log(owner1);
log(owner2);

```
  		
```js
//데이터를 수정하지 못하도록
let defaultOwner = { firstName: "마틴", lastName: "파울러" };
function getDefaultOwner() {
  return new Person(defaultOwner); //<-생성자를 넣어줌
}

class Person {
  constructor(data) {
    this._lastName = data.lastName;
    this._firstName = data.firstName;
  }
  get lastName() {
    return this._lastName;
  }
  get firstName() {
    return this._firstName;
  }
}

const owner1 = getDefaultOwner();
const owner2 = getDefaultOwner();
owner2.lastName = "김"; //<-set!

log(owner2.lastName);
log(owner1.lastName);
```

`Cannot set property lastName of #<Person> which has only a getter`

오로지 데이터를 get할수밖에 없는 상황이다.
만약, 이 방법으로 굳이 set까지 해야겠다면,
 class 내부에   `set lastName(str) {
    return (this._lastName = str);
  }` 코드가 필요하다.
  
###   - 매개변수 객체 만들기(6.8)
  : 데이터 항목의 여러개가 인자로 여러번 사용되는 경우, 데이터 구조를 하나로 묶어 하나의 객체만 전달한다. 코드 인자갯수를 정리하면서도 관련 메서드를 객체 내의 새로운 메서드로 생성할 수 있는 이점이 있다.
  
```js
//변경 전
function example(a, b, c){
	...
}

example(score.math, score.science, score.english)
```

```js
//변경 후 : 하나의 데이터 객체로 만들어줌
class subject {
	constructor(math, science, english){
		this._data = {math: math, science: sciece, english: english}
	}

	get score(){
		return this._data;
	}
}

function example(subject){ 
	//<-하나의 `subject` 데이터 구조에서 필요한 값을 추출해 사용
	const {math, science, english} = subject.score
	...
}

```
###   - 여러 함수 클래스로 묶기  (6.9)
: 데이터 구조를 하나로 묶으면서 데이터와 함수간 공유환경을 확인할 수 있고, 각 함수에 전달되는 인수를 줄여 객체 내에서 함수 호출을 간결하게 만들 수 있다.

### - 여러 함수를 변환 함수로 묶기 (6.10)
: 6.9절처럼 클래스로 묶는 것이 아닌 함수로 묶는 방법이다.
원본 데이터가 코드 안에서 갱신 될 때에는 클래스로 묶는 것이 낫다. 변환 함수로 묶으면 가공한 데이터를 새로운 레코드에 저장하므로 원본 데이터가 수정되면 일관성이 깨질 수 있기 때문.

: 여러 함수를 한 곳에 묶는 이유는 **도출 로직이 중복되는 것을 피하기 위해**서이다.
추출된 함수에서도 같은 효과를 예상할 수 있지만, 데이터 구조와 사용하는 함수의 로직이 가까이에 있지 않으면 사용하지 않고 중복된 기능의 함수를 생성할수 있기 때문이다.
변환함수/클래스를 생성하여 이 로직을 통해 필요한 함수를 찾아 쓰도록 하면 이런 경우가 줄어든다.

: 미가공 측정값을 입력받아 다양한 가공 정보를 덧붙여 반환하는 방식이다.
```js
//작업 전: 미가공 측정값만 받아 반환하는 상태
function bootcampe(student){
  const result = _.cloneDeep(student)
  return result
}

//작업 후: 필요한 메서드가 붙여져 결과를 반환하고 있다.
function bootcampe(student){
  const result=_.cloneDeep(student)
  result.javascriptSkill = plus(result)
  result.communication = multiply(result)
  return result;
}
```
`*`주의할 점: 위 함수처럼 정보를 덧붙여 결과를 반환할 때는 원본 측정값 레코드가 변경되지 않도록 해야한다. =>`deepCopy`



### - 단계 쪼개기 (6.11)
입력이 처리 로직에 적합하지 않은 형태로 들어오는 경우,  본 작업에 들어가기 전에 입력값을 다루기 편한 형태로 가공.
중간 데이터 구조를 만들어 앞서 추출한 함수의 인수로 추가하고, 테스트를 진행하며 전달하던 인자를 하나씩 데이터 구조로 옮긴다.

```javascript
ex) B라는 함수로부터 a,b,c,d,e의 인자를 전달받는 A함수
=> before
function A(a,b,c,d,e){
  ...
}

=> after1
function B(){
  ...
  const dataObj = {a, b, c, d}
}
=> after2
function B(){
  ...
  const dataObj = getDataObj()
}

function getDataObj(){
  ...
  return {a, b, c, d}
}

function A(dataObj, e){
  ...
}
```
