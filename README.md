# Refactoring
Reading Refactoring

## chapter 01
1번부터 끝까지 정독을 해야 프로그램의 흐름을 파악할 수 있을 것 같은 구조이다.  
리팩터링을 하면서 불필요한 매개변수를 인라인 함수로 선언하며 줄여나가고  
인라인 함수결과가 statement라는 자료구조로 만들어지는 과정이 흥미로웠다.  

또한 함수형에서 클래스로 변경했고 '계산'과 관련된 기능을 담았다.
클래스의 다형성 때문에 play의 장르가 추가되면 관련한 서브 클래스를 만들고 메서드를 커스텀화하겠구나 라는 걸 인지할 수 있다.

비록 파일은 여러개로 늘어나고, 코드양도 훨 늘어난것 같아 `이게 리팩토링 맞아?` 🤔라는 의문이 들긴했지만   
이젠 코드를 대충 보아도 `아 이부분은 계산기능, 여기는 출력 부분!` 등 한눈에 파악할 수 있는 코드가 되었다.

**chapter 01 before/after :** https://github.com/skawnkk/Refactoring/pull/4/files

  
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
: 데이터 구조를 하나로 묶으면서 공유환경을 확인할 수 있고, 각 함수에 전달되는 인수를 줄여 객체 내에서 함수 호출을 간결하게 만들 수 있다.

### - 여러 함수를 변환 함수로 묶기 (6.10)
: 6.9절처럼 클래스로 묶는 것이 아닌 함수로 묶는 방법이다.
원본 데이터가 코드 안에서 갱신 될 때에는 클래스로 묶는 것이 낫다.

: 여러 함수를 한 곳에 묶는 이유는 도출 로직이 중복되는 것을 피하기 위해서이다.
추출된 함수에서도 같은 효과를 예상할 수 있지만, 데이터 구조와 사용하는 함수의 로직이 가까이에 있지 않으면 사용하지 않고 중복된 기능의 함수를 생성할수 있기 때문이다.
변환함수/클래스를 생성하여 이  로직을 통해 필요한 함수를 찾아 쓰도록 하면 이런 경우가 줄어든다.

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


