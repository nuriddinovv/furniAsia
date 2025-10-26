// NavigationService.ts
import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function replace(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      }),
    );
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
