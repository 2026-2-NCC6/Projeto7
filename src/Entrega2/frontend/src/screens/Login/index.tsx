import { Button } from '../../components/Button';
import { FormTextField } from '../../components/FormTextField';
import { LogoMark } from '../../components/LogoMark';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { useSignIn } from '../../hooks/useSignIn';
import { useAuthStore } from '../../store/authStore';
import {
  BrandName,
  Content,
  FooterAction,
  FooterPrompt,
  FormError,
  Heading,
  Spacer,
  Subheading,
} from '../shared/authStyles';
import { OrDivider } from './components/OrDivider';
import {
  BrandRow,
  Fields,
  ForgotPasswordLabel,
  ForgotPasswordRow,
  GuestSpacing,
  Intro,
} from './styles';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
}

export function LoginScreen({ onNavigateToSignUp }: LoginScreenProps) {
  const { form, submit, formError, submitting } = useSignIn();
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);

  return (
    <Screen edges={['top', 'bottom']}>
      <Content>
        <BrandRow>
          <LogoMark />
          <BrandName>{texts.brand}</BrandName>
        </BrandRow>

        <Spacer />

        <Intro>
          <Heading>{texts.login.heading}</Heading>
          <Subheading>{texts.login.subheading}</Subheading>
        </Intro>

        <Fields>
          <FormTextField
            control={form.control}
            name="email"
            placeholder={texts.login.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField
            control={form.control}
            name="password"
            placeholder={texts.login.password}
            secureTextEntry
            autoCapitalize="none"
          />
        </Fields>

        <ForgotPasswordRow>
          <ForgotPasswordLabel>{texts.login.forgotPassword}</ForgotPasswordLabel>
        </ForgotPasswordRow>

        {formError ? <FormError>{formError}</FormError> : null}

        <Button label={submitting ? texts.login.submitting : texts.login.submit} onPress={submit} disabled={submitting} />

        <GuestSpacing>
          <OrDivider />
        </GuestSpacing>

        <Button label={texts.login.guest} variant="outline" onPress={continueAsGuest} />

        <Spacer />

        <FooterPrompt>
          {texts.login.footerPrompt}
          <FooterAction onPress={onNavigateToSignUp}>{texts.login.footerAction}</FooterAction>
        </FooterPrompt>
      </Content>
    </Screen>
  );
}
